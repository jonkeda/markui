# MarkUI Full Examples

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Purpose:** Full-screen and full-application MarkUI examples. The widget reference lives in `04-markui-widget-reference.md`.

Full examples are larger than the focused examples in Doc 04. Each example is shown twice: once as plain `text` for source comparison and once as `markui` for rendered preview.

---

## Email Client

```text
+----------------------------------------------+
| #1 Mail              <Search________> [#2]   |
+--------+-------------------------------------+
| Inbox  | | [x] | From          | Subject v | |
| Sent   | |-----|---------------|-----------| |
| Drafts | | [ ] | Alice Smith   | Meeting   | |
| Trash  | | [x] | Bob Jones     | Deploy    | |
| Labels | | [ ] | Diana Prince  | Review    | |
| (Work) |                                     |
+--------+-------------------------------------+
| [Reply]  [Forward]  [Archive]  [Delete]      |
+----------------------------------------------+
```

```markui
+----------------------------------------------+
| #1 Mail              <Search________> [#2]   |
+--------+-------------------------------------+
| Inbox  | | [x] | From          | Subject v | |
| Sent   | |-----|---------------|-----------| |
| Drafts | | [ ] | Alice Smith   | Meeting   | |
| Trash  | | [x] | Bob Jones     | Deploy    | |
| Labels | | [ ] | Diana Prince  | Review    | |
| (Work) |                                     |
+--------+-------------------------------------+
| [Reply]  [Forward]  [Archive]  [Delete]      |
+----------------------------------------------+
```

---

## Analytics Dashboard

```text
+--- Analytics Dashboard ---------------------------------------+
|                                                              |
| +--- Users -------+ +--- Revenue -----+ +--- Orders -----+   |
| | #1 1,234        | | #2 $45,678      | | #3 892          |   |
| | Active users    | | This month      | | Pending: 23     |   |
| +-----------------+ +-----------------+ +-----------------+   |
|                                                              |
| +--- Recent Activity -------------------------------------+   |
| | Name       | Action    | Time     | Status  |           |   |
| |------------|-----------|----------|---------|           |   |
| | Alice      | Login     | 2m ago   | Active  |           |   |
| | Bob        | Upload    | 5m ago   | Active  |           |   |
| | Charlie    | Logout    | 15m ago  | Away    |           |   |
| +---------------------------------------------------------+   |
|                                                              |
+--------------------------------------------------------------+
```

```markui
+--- Analytics Dashboard ---------------------------------------+
|                                                              |
| +--- Users -------+ +--- Revenue -----+ +--- Orders -----+   |
| | #1 1,234        | | #2 $45,678      | | #3 892          |   |
| | Active users    | | This month      | | Pending: 23     |   |
| +-----------------+ +-----------------+ +-----------------+   |
|                                                              |
| +--- Recent Activity -------------------------------------+   |
| | Name       | Action    | Time     | Status  |           |   |
| |------------|-----------|----------|---------|           |   |
| | Alice      | Login     | 2m ago   | Active  |           |   |
| | Bob        | Upload    | 5m ago   | Active  |           |   |
| | Charlie    | Logout    | 15m ago  | Away    |           |   |
| +---------------------------------------------------------+   |
|                                                              |
+--------------------------------------------------------------+
```

---

## Registration Flow

### Step 1: Account

```text
# Create Your Account

Step 1 of 3

Email:
<user@example.com________>
(?) We'll send a verification code.

Password:
<****____________________>

[Next]

_Already have an account?_
```

```markui
# Create Your Account

Step 1 of 3

Email:
<user@example.com________>
(?) We'll send a verification code.

Password:
<****____________________>

[Next]

_Already have an account?_
```

### Step 2: Profile

```text
# Complete Your Profile

Step 2 of 3

!==IMG==!


[Upload Photo]

Display Name:
<Jane Smith_____________>

Bio:
<                              >
<                              >

[Back]  [Next]
```

```markui
# Complete Your Profile

Step 2 of 3

!==IMG==!


[Upload Photo]

Display Name:
<Jane Smith_____________>

Bio:
<                              >
<                              >

[Back]  [Next]
```

### Step 3: Preferences

```text
# Set Your Preferences

Step 3 of 3

Interests:
(Technology)  (Design)  (Science)

Notifications:
[x] Email notifications
[ ] SMS notifications

Theme:
<System Default v>

[Back]  [Create Account]
```

```markui
# Set Your Preferences

Step 3 of 3

Interests:
(Technology)  (Design)  (Science)

Notifications:
[x] Email notifications
[ ] SMS notifications

Theme:
<System Default v>

[Back]  [Create Account]
```

---

## Project Board

```text
+--[Overview]--[[Board]]--[Timeline]--[Team]----------------+
|                                                           |
| [#1 Filter]  [#2 Sort]  [+ Add Task]                      |
|                                                           |
| | To Do      | Doing      | Done        |                 |
| |------------|------------|-------------|                 |
| | Auth flow  | API v2     | DB schema   |                 |
| | Backend    | Backend    | Backend     |                 |
| | Alice      | Bob        | Charlie     |                 |
| | Dashboard  | Tests      |             |                 |
| | Frontend   | QA         |             |                 |
| | Diana      | Eve        |             |                 |
|                                                           |
+-----------------------------------------------------------+
```

```markui
+--[Overview]--[[Board]]--[Timeline]--[Team]----------------+
|                                                           |
| [#1 Filter]  [#2 Sort]  [+ Add Task]                      |
|                                                           |
| | To Do      | Doing      | Done        |                 |
| |------------|------------|-------------|                 |
| | Auth flow  | API v2     | DB schema   |                 |
| | Backend    | Backend    | Backend     |                 |
| | Alice      | Bob        | Charlie     |                 |
| | Dashboard  | Tests      |             |                 |
| | Frontend   | QA         |             |                 |
| | Diana      | Eve        |             |                 |
|                                                           |
+-----------------------------------------------------------+
```

