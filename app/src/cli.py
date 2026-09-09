"""Small command line for user management.

    docker compose exec chart python -m src.cli adduser robert
    docker compose exec chart python -m src.cli passwd robert
    docker compose exec chart python -m src.cli sessions --clear

English only, like the log: this is run by an operator in a shell, not by a
visitor in a browser.
"""

import argparse
import getpass
import sys

from . import auth, db


def main() -> int:
    parser = argparse.ArgumentParser(prog="src.cli")
    sub = parser.add_subparsers(dest="cmd", required=True)
    for name in ("adduser", "passwd"):
        p = sub.add_parser(name)
        p.add_argument("username")
    s = sub.add_parser("sessions")
    s.add_argument("--clear", action="store_true", help="end all sessions")

    args = parser.parse_args()
    db.init()

    if args.cmd in ("adduser", "passwd"):
        pw = getpass.getpass("Password: ")
        if len(pw) < 12:
            print("The password must be at least 12 characters long.", file=sys.stderr)
            return 1
        if pw != getpass.getpass("Repeat: "):
            print("The two entries do not match.", file=sys.stderr)
            return 1
        auth.create_user(args.username, pw)
        print(f"User '{args.username}' saved.")
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
