# Full Application

A complete project management application with multiple views.

## Main View

```markui
+--------------------------------------------------------------+
| #1 ProjectHub        <Search____________>  #2  {3}  !==IMG==! |
+----------+---------------------------------------------------+
| #3 Home  | Home > Projects > Alpha                            |
| #4 Board |                                                    |
| #5 Tasks | ## Project Alpha                                   |
| #6 Files |                                                    |
| #7 Team  | +--- Overview ----------+  +--- Stats --------+   |
|          | | Status:  (Active)      |  | Tasks:    42       |   |
| ---      | | Lead:    Alice Smith   |  | Complete: 28       |   |
| #8 Gear  | | Sprint:  Sprint 12    |  | Progress:          |   |
|          | | Due:     Jun 15, 2026  |  | [========..] 67%   |   |
|          | +------------------------+  +-------------------+   |
|          |                                                    |
|          | +--- Recent Activity --------------------------+   |
|          | | Bob completed "API endpoints"                #   |
|          | | Alice created Sprint 12                      #   |
|          | | Charlie moved "Auth" to In Progress          #   |
|          | +----------------------------------------------+   |
+----------+---------------------------------------------------+
```

## Board View

```markui
+--[Overview]--[[Board]]--[Timeline]--[Team]--+
|                                              |
| [#1 Filter]  [#2 Sort]  [+ Add Task]        |
|                                              |
| +--- To Do ----+  +--- Doing ----+  +--- Done ------+
| |               |  |              |  |                |
| | *-----------* |  | *----------* |  | *------------* |
| | | Auth flow | |  | | API v2   | |  | | DB schema  | |
| | | (Backend) | |  | | (Backend)| |  | | (Backend)  | |
| | | #3 Alice  | |  | | #3 Bob   | |  | | #3 Charlie | |
| | *-----------* |  | *----------* |  | *------------* |
| |               |  |              |  |                |
| | *-----------* |  | *----------* |  | [...]          |
| | | Dashboard | |  | | Tests    | |  +----------------+
| | | (Frontend)| |  | | (QA)     | |
| | | #3 Diana  | |  | | #3 Eve   | |
| | *-----------* |  | *----------* |
| |               |  |              |
| | [...]         |  +------ ------+
| +---------------+
|
+----------------------------------------------+
```

## Task Detail Modal

```markui
+--@Modal--- Edit Task ----------------------------------------+
|                                                               |
|  Title:                                                       |
|  <API v2 endpoints_________________________________>          |
|                                                               |
|  Status:    <In Progress v>                                   |
|  Assignee:  <Bob Johnson v>                                   |
|  Priority:  (*) High  ( ) Medium  ( ) Low                     |
|  Sprint:    <Sprint 12 v>                                     |
|  Due:       <@datepicker>                                     |
|                                                               |
|  Description:                                                 |
|  <                                                          > |
|  <                                                          > |
|  <                                                          > |
|  <                                                          > |
|                                                               |
|  Labels:                                                      |
|  (Backend x)  (API x)  (Priority)                             |
|                                                               |
|  ---                                                          |
|                                                               |
|  [Subtasks ^]                                                 |
|  |  [x] Design API schema                                    |
|  |  [x] Implement GET endpoints                              |
|  |  [ ] Implement POST endpoints                             |
|  |  [ ] Write integration tests                              |
|  +--+                                                         |
|                                                               |
|  [Save]  [Delete]  [Cancel]                                   |
|                                                               |
+---------------------------------------------------------------+
```

## Team Members

```markui
+--- Team ------------------------------------------------+
|                                                          |
|  <Search team members________>                           |
|                                                          |
|  | Name           | Role        | Tasks | Status    |    |
|  |----------------|-------------|-------|-----------|    |
|  | Alice Smith    | Lead        |    12 | Active    |    |
|  | Bob Johnson    | Backend     |     8 | Active    |    |
|  | Charlie Brown  | Backend     |     6 | On Leave  |    |
|  | Diana Prince   | Frontend    |    10 | Active    |    |
|  | Eve Wilson     | QA          |     5 | Active    |    |
|                                                          |
|  [Invite Member]                                         |
|                                                          |
+---------------------------------------------------------+
```
