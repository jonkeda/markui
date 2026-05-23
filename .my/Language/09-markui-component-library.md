# MarkUI Component Library

**Date:** 2026-05-24
**Status:** v1.0
**Purpose:** Visual component library with rendered `markui` examples. Open this file with MarkUI extension enabled to see live previews.

---

## 1. Buttons & Actions

### Button

```markui
[Submit]  [Cancel]  [Delete]
```

### Icon Button

```markui
[#1 Search]  [#2 Settings]  [#3 Home]
```

### Split Button

```markui
[Save][v]
```

### Navigation Buttons

```markui
[<] Previous    Next [>]
```

---

## 2. Checkboxes & Radios

### Checkboxes

```markui
[x] Accept terms
[ ] Subscribe to newsletter
[-] Select all (mixed)
```

### Radio Buttons

```markui
(*) Express shipping
( ) Standard shipping
( ) Economy shipping
```

---

## 3. Text Inputs

### Basic Inputs

```markui
Username:
<________________________>

Password:
<****____________________>

Email:
<user@example.com________>
```

### Input with Annotations

```markui
Password:
<****____________________>
(?) Must be at least 8 characters

Email:
<________________________>
(x) Please enter a valid email address
```

### Textarea

```markui
Description:
<                              >
<                              >
<                              >
```

---

## 4. Dropdowns

### Closed Dropdown

```markui
Country:
<Select country v>
```

### Open Dropdown

```markui
Fruit:
<Apple ^>
  Apple
  Banana
  Orange
  Mango
->
```

### Custom Inputs

```markui
Date:    <@datepicker>
Color:   <@colorpicker>
Search:  <@autocomplete>
```

---

## 5. Toggles, Sliders & Steppers

### Toggle Switches

```markui
Dark mode      {[on]/off}
Notifications  {on/[off]}
Auto-save      {[on]/off}
```

### Slider

```markui
Volume:  [=====.....] 50%
```

### Stepper

```markui
Quantity: [- 3 +]
```

### Rating

```markui
Rating: [***..] 3/5
```

### Progress Bar

```markui
[=======...] 70%
```

---

## 6. Text & Display

### Headings

```markui
# Page Title
## Section Heading
### Subsection
```

### Labels & Links

```markui
This is a plain text label
_Click here for details_
_https://example.com_
```

### Badge

```markui
Messages {3}    Alerts {!}
```

### Icons

```markui
#1 Home   #2 Settings   #3 Profile   #4 Search
```

### Separator

```markui
First section content
---
Second section content
```

### Spinner

```markui
[/] Loading...
```

---

## 7. Tags & Chips

### Tags

```markui
(React) (TypeScript) (Node.js)
```

### Removable Chips

```markui
(React) (Vue x) (Angular x) (Svelte x)
```

---

## 8. Boxes & Containers

### Basic Box

```markui
+------------------------------+
| Content inside a box         |
+------------------------------+
```

### Titled Box

```markui
+--- User Profile -------------------------+
| Name:    John Doe                        |
| Email:   john@example.com               |
| Role:    Administrator                   |
+------------------------------------------+
```

### Open-Right Box

```markui
+--- Login ---+
|
|  Username:
|  <________________________>
|
|  Password:
|  <****____________________>
|
|  [x] Remember me
|
|  [Login]  _Forgot password?_
|
+--+
```

### Card (Repeatable)

```markui
*--- Product ---* *--- Product ---*
| Widget A      | | Widget B      |
| $19.99        | | $29.99        |
| [Add to cart] | | [Add to cart] |
*---------------* *---------------*
```

---

## 9. Nested Boxes

### Full Nested

```markui
+--- Dashboard ----------------------------+
| +--- Stats --------+ +--- Chart -------+ |
| | Users: 1,234     | | [=======...] 70%| |
| | Active: 892      | |                 | |
| +------------------+ +-----------------+ |
+-------------------------------------------+
```

### Prefix Nested

```markui
+--- Settings ---+
|
++--- Profile ---+

  Name:
  <John Doe____________>

  Bio:
  <________________________>

++--- Preferences ---+

  Dark mode     {[on]/off}
  Notifications {[on]/off}

+--+
```

---

## 10. Navigation

### Tab Bar

```markui
+--[[Overview]]--[Details]--[Settings]--+
| Overview tab content here             |
|                                       |
| Name:  <John Doe_________>           |
| Email: <john@example.com_>           |
+---------------------------------------+
```

### Breadcrumb

```markui
Home > Products > Electronics > Laptops
```

### Pagination

```markui
[<] 1 2 [[3]] 4 5 ... 10 [>]
```

### Accordion

```markui
[General Settings ^]
|  Language:  <English v>
|  Timezone:  <UTC+1 v>
+--+

[Advanced Settings v]

[About v]
```

### Tree View

```markui
- Documents
  - Work
    - Project Alpha
    - Project Beta
  + Personal
+ Downloads
- readme.txt
```

---

## 11. Tables

### Basic Table

```markui
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
| Charlie    |  35 | Manager   |
```

### Sortable Table with Selection

```markui
| [x] | Name  v    | Status  | Actions   |
|------|------------|---------|-----------|
| [ ]  | Alice      | Active  | [Edit]    |
| [x]  | Bob        | Pending | [Edit]    |
| [ ]  | Charlie    | Active  | [Edit]    |
```

---

## 12. Scroll & Splitters

### Scroll Region

```markui
+--- Messages ---------------------+
| #1 New message from Alice        #
| #2 Meeting reminder              #
| #3 Deploy complete               #
| #4 Review requested              #
+----------------------------------+
```

### Resizable Splitter

```markui
+----------.------------------------+
| Sidebar  . Main Content           |
| [Nav 1]  . Welcome to the app     |
| [Nav 2]  .                        |
| [Nav 3]  . Some text goes here    |
+----------.------------------------+
```

---

## 13. Dock Layout

```markui
+--------------------------------------+
| #1 App Name              #2 [#3]    |
+--------+-------------------------+---+
| Home   | Dashboard               |   |
| Users  |                         |   |
| Reports| Users: 1,234            |   |
| -------| Active: 892             |   |
| Settings                         |   |
+--------+-------------------------+---+
| Ready               Ln 42, Col 8    |
+--------------------------------------+
```

---

## 14. Typed Containers

### Modal

```markui
+--@Modal--- Confirm Deletion ----------+
|                                        |
|  Are you sure you want to delete       |
|  this item? This cannot be undone.     |
|                                        |
|  [Delete]  [Cancel]                    |
|                                        |
+----------------------------------------+
```

### Drawer

```markui
+--@Drawer--- Filter Results ---+
|
|  Category:
|  <All categories v>
|
|  Price range:
|  [=====.....] $0 - $500
|
|  Rating:
|  [***..] 3+ stars
|
|  [Apply Filters]
|
+--+
```

---

## 15. Toast Notifications

```markui
+-- (v) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please try again.  |
+-----------------------------------+

+-- (i) ----------------------------+
| 3 new messages received           |
+-----------------------------------+
```

---

## 16. Annotations

```markui
+--- Registration ---+
|
|  Full Name:
|  <________________________>
|  (?) First and last name
|
|  Email:
|  <________________________>
|  (x) Please enter a valid email
|
|  Password:
|  <****____________________>
|  (?) Must be at least 8 characters
|
|  [Create Account]
|  ($) Click to submit the registration
|
+--+
```

---

## 17. Image & Avatar

### Image Placeholder

```markui
!=========!
!   IMG   !
!  16:9   !
!=========!
```

### Inline Image

```markui
!==IMG==!  Product Name
           $29.99
           [Add to cart]
```

---

## 18. Component Reference

### Named Components

Define reusable components using named blocks:

```markui:user-card
*-----------------------*
| !==IMG==!  User Name  |
|            Role       |
*-----------------------*
```

```markui:product-tile
*-----------------------*
| !==IMG==!             |
| Product Name          |
| $00.00                |
| [Add to cart]         |
*-----------------------*
```

### Using Components

Reference components with `@name`:

```markui
+--- Team Members ---+
|
|  @user-card
|  @user-card
|  @user-card
|
+--+
```

---

## 19. Complete Example: Email Client

```markui
+----------------------------------------------+
| #1 Mail              <Search________> [#2]   |
+--------+-------------------------------------+
|[[Inbox]]| [x] | From          | Subject    v |
|  Sent   |-----|---------------|--------------|
|  Drafts | [ ] | Alice Smith   | Meeting notes|
|  Trash  | [x] | Bob Jones     | Re: Deploy   |
| --------| [ ] | Charlie Brown | New feature  |
| Labels  | [ ] | Diana Prince  | Review PR    |
| (Work)  |     |               |              |
|(Personal)     |               |              |
+--------+-------------------------------------+
| [Reply]  [Forward]  [Archive]  [Delete]      |
+----------------------------------------------+
```

---

## 20. Complete Example: Dashboard

```markui
+--- Analytics Dashboard -----------------------------------------------+
|                                                                        |
| +--- Users -------+ +--- Revenue -----+ +--- Orders -----+           |
| | #1 1,234        | | #2 $45,678      | | #3 892          |           |
| | Active users    | | This month      | | Pending: 23     |           |
| +------ ----------+ +-----------------+ +-----------------+           |
|                                                                        |
| +--- Recent Activity ------------------------------------------------+|
| | | Name       | Action    | Time     | Status  |                    ||
| | |------------|-----------|----------|---------|                    ||
| | | Alice      | Login     | 2m ago   | (Active)|                   ||
| | | Bob        | Upload    | 5m ago   | (Active)|                   ||
| | | Charlie    | Logout    | 15m ago  | (Away)  |                   ||
| +--------------------------------------------------------------------+|
|                                                                        |
+------------------------------------------------------------------------+
```

---

*MarkUI Component Library v1.0 — May 2026*
