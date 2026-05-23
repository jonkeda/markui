# Data Display

Tables, cards, progress indicators, and data patterns.

## Simple Table

```markui
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
| Charlie    |  35 | Manager   |
```

## Table with Selection and Sorting

```markui
| [x] | Name  v    | Status   | Actions    |
|-----|------------|----------|------------|
| [ ] | Alice      | Active   | _Edit_     |
| [x] | Bob        | Pending  | _Edit_     |
| [ ] | Charlie    | Inactive | _Edit_     |
```

## Product Cards

Cards use `*` corners to indicate repeatable elements.

```markui
*--- Product --------*  *--- Product --------*
| !==IMG==!           |  | !==IMG==!           |
| Wireless Mouse     |  | USB Keyboard        |
| $29.99             |  | $49.99              |
| [***..] 3/5        |  | [****.]  4/5        |
| [Add to Cart]      |  | [Add to Cart]       |
*--------------------*  *---------------------*
[...]
```

## Progress and Ratings

```markui
Upload:   [=======...] 70%
Download: [==========] 100%
Waiting:  [..........] 0%

---

Product A: [***..] 3/5
Product B: [*****] 5/5
Product C: [*....] 1/5
```

## Badges and Tags

```markui
Inbox {12}  Drafts {3}  Spam {!}

---

(JavaScript)  (TypeScript)  (React x)  (Vue x)  (Angular)
```

## Toast Notifications

```markui
+-- (v) ----------------------------+
| File saved successfully.          |
+-----------------------------------+

+-- (!) ----------------------------+
| Your session expires in 5 min.    |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please retry.      |
+-----------------------------------+
```
