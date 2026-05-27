# MarkUI Buttons, Forms, And Controls

Use this reference for inline widgets and form controls.

## Buttons

```markui
[Save]  [Cancel]  [Delete]
```

- `[Label]` is a button unless a higher-priority square-bracket rule matches.
- `[#N Label]` is an icon button. Define numbered icon meaning outside the wireframe.
- `[Action][v]` and `[Action][^]` are split buttons. The two bracketed controls must touch.
- `[<]` and `[>]` are previous/next buttons.

## Checkboxes And Radios

```markui
[ ] Unchecked
[x] Checked
[-] Mixed

(*) Selected
( ) Unselected
```

- Use checkboxes for independent choices.
- Use radios for mutually exclusive choices.
- Consecutive radio lines form a group.

## Inputs

```markui
Name:
<Jane Smith_____________>

Password:
<****____________________>

Start date:
<__/__/____>

Quantity:
<123______>
```

- Text inside inputs is example data, not placeholder copy.
- Underscores indicate editable area.
- Password inputs use asterisks for obscured example data.
- Date and number inputs use date-shaped or numeric example data.

Textarea rows are consecutive same-width input lines:

```markui
Description:
<                              >
<                              >
<                              >
```

## Dropdowns And Custom Inputs

```markui
Country:
<Germany v>
```

```markui
Fruit:
<Apple ^>
  Apple
  Banana
  Orange
->
```

```markui
Tags:
<3 selected ^>
  [x] React
  [ ] Vue
  [x] TypeScript
->
```

- Closed dropdown: `<Label v>`.
- Open dropdown: `<Label ^>`.
- The space before `v` or `^` is required.
- Visible option lists close with `->`.
- Do not show option rows below a closed dropdown.
- Custom input: `<@datepicker>`, `<@colorpicker>`, `<@autocomplete>`.

## Display Text And Compact Controls

```markui
# Page Title
## Section Heading
### Subsection

_Forgot password?_  _Create account_

#1 Home   #2 Settings   #3 Profile

Messages {3}    Alerts {!}

Dark mode  {[on]/off}
Notifications  {on/[off]}

Volume: [=====.....] 50%
[=======...] 70%
Quantity: [- 3 +]
Rating: [***..] 3/5
[/] Loading...

(React) (Vue x) (TypeScript)
```

- Headings use `#`, `##`, and `###`.
- Links are underscore-wrapped text outside inputs.
- Badges are `{3}` or `{!}`.
- Toggles wrap the active state in square brackets.
- Chips are parenthesized text that is not a reserved annotation prefix.
- Removable chips use trailing ` x` before the closing parenthesis.
- Reserved annotation prefixes are `(?)`, `($)`, `(!)`, `(i)`, `(x)`, and `(v)`.
