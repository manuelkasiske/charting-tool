"""Small command line for user management.

    docker compose exec chart python -m src.cli adduser NAME
    docker compose exec chart python -m src.cli adduser NAME --groups portfolio,general
    docker compose exec chart python -m src.cli passwd NAME
    docker compose exec chart python -m src.cli groups NAME admin general
    docker compose exec chart python -m src.cli groups NAME              (show)
    docker compose exec chart python -m src.cli sessions --clear

adduser without --groups: the first user on an installation without an
admin becomes admin (and general); everybody after that starts in general
only (auth.default_groups). passwd leaves the groups alone.

The groups command is also the way back in, should the last admin ever lose
the group: the web interface refuses that, the shell does not ask.

English only, like the log: this is run by an operator in a shell, not by a
visitor in a browser.
"""

import argparse
import getpass
import sys

from . import auth, db


def _groups(text: str) -> list[str]:
    wanted = [g.strip() for g in text.split(",") if g.strip()]
    unknown = [g for g in wanted if g not in auth.GROUPS]
    if unknown or not wanted:
        raise argparse.ArgumentTypeError(
            f"groups must be a comma-separated choice of {', '.join(auth.GROUPS)}")
    return wanted


def _user_id(username: str):
    with db.cursor() as conn:
        row = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    return row["id"] if row else None


def main() -> int:
    parser = argparse.ArgumentParser(prog="src.cli")
    sub = parser.add_subparsers(dest="cmd", required=True)
    add = sub.add_parser("adduser", help="create a user, or set the password of an existing one")
    add.add_argument("username")
    add.add_argument("--groups", type=_groups, metavar="G1,G2",
                     help=f"{', '.join(auth.GROUPS)}; default: admin for the first user, "
                          "general for everybody after")
    pw = sub.add_parser("passwd", help="set a new password; ends all sessions of the user")
    pw.add_argument("username")
    g = sub.add_parser("groups", help="show or set the groups of a user")
    g.add_argument("username")
    g.add_argument("groups", nargs="*", help=f"{', '.join(auth.GROUPS)}; none = show")
    s = sub.add_parser("sessions", help="list sessions")
    s.add_argument("--clear", action="store_true", help="end all sessions")

    args = parser.parse_args()
    db.init()
    db.migrate()

    if args.cmd in ("adduser", "passwd"):
        if not auth.USERNAME_RE.match(args.username):
            print("Username: 2-32 characters, only a-z, 0-9, dot, hyphen and underscore.",
                  file=sys.stderr)
            return 1
        existing = _user_id(args.username)
        if args.cmd == "passwd" and existing is None:
            print(f"No user '{args.username}'. Create it with adduser.", file=sys.stderr)
            return 1
        password = getpass.getpass("Password: ")
        if not auth.MIN_PASSWORD <= len(password) <= auth.MAX_PASSWORD:
            print(f"The password must be at least {auth.MIN_PASSWORD} characters long.",
                  file=sys.stderr)
            return 1
        if password != getpass.getpass("Repeat: "):
            print("The two entries do not match.", file=sys.stderr)
            return 1
        groups = getattr(args, "groups", None)
        if existing is None and groups is None:
            groups = auth.default_groups()
        auth.create_user(args.username, password)
        if groups is not None:
            auth.set_groups(_user_id(args.username), groups)
        print(f"User '{args.username}' saved: "
              f"{', '.join(auth.groups_of(_user_id(args.username))) or '(no group)'}")
        return 0

    if args.cmd == "groups":
        user_id = _user_id(args.username)
        if user_id is None:
            print(f"No user '{args.username}'.", file=sys.stderr)
            return 1
        unknown = [x for x in args.groups if x not in auth.GROUPS]
        if unknown:
            print(f"Unknown group(s): {', '.join(unknown)}. Known: {', '.join(auth.GROUPS)}",
                  file=sys.stderr)
            return 1
        if args.groups:
            auth.set_groups(user_id, args.groups)
        print(f"{args.username}: {', '.join(auth.groups_of(user_id)) or '(no group)'}")
        return 0

    with db.cursor() as conn:
        if args.clear:
            conn.execute("DELETE FROM sessions")
            print("All sessions ended.")
        else:
            for r in conn.execute(
                "SELECT u.username, s.ip, s.created_at, s.expires_at "
                "FROM sessions s JOIN users u ON u.id = s.user_id"
            ):
                print(dict(r))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
