"""
The kinds of notifications a user can turn off, account-wide (every device).

Everything is on by default: a user turns a kind off in the Notifications
module, which stores `{kind: false}` in `User.notification_prefs`. Turning a
device on or off is another matter (the push subscription of that device).
"""

TRAP_READING = 'trap_reading'
TRAP_REFILL = 'trap_refill'
GROUP_MESSAGE = 'group_message'
PLATFORM_MESSAGE = 'platform_message'
# A message to one's own devices: never filtered
TEST = 'test'

KINDS = {
    TRAP_READING: "Rappels de relevé",
    TRAP_REFILL: "Rappels d'attractif",
    GROUP_MESSAGE: "Messages de mon groupe",
    PLATFORM_MESSAGE: "Messages de la plateforme",
}


def wants(user, kind: str) -> bool:
    """Whether `user` (a local User) receives `kind`; unknown users and kinds receive."""
    if user is None or kind not in KINDS:
        return True
    return (user.notification_prefs or {}).get(kind, True) is not False
