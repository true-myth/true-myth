# Twoslash Error Analysis Report

Generated: 2025-08-30T20:22:52.880Z

## Summary

- **Total Errors**: 197
- **Categories**: 9

## Error Categories

### OTHER (60 errors)

**Example:**

```typescript
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();
```

**Fix suggestions:**

**All errors in this category:**
1. Error 1
2. Error 3
3. Error 5
4. Error 6
5. Error 7
6. Error 9
7. Error 11
8. Error 12
9. Error 23
10. Error 25
11. Error 26
12. Error 27
13. Error 30
14. Error 32
15. Error 33
16. Error 34
17. Error 37
18. Error 38
19. Error 45
20. Error 46
21. Error 53
22. Error 54
23. Error 55
24. Error 64
25. Error 65
26. Error 67
27. Error 69
28. Error 71
29. Error 72
30. Error 79
31. Error 80
32. Error 89
33. Error 95
34. Error 96
35. Error 99
36. Error 120
37. Error 123
38. Error 125
39. Error 127
40. Error 129
41. Error 130
42. Error 134
43. Error 147
44. Error 149
45. Error 151
46. Error 152
47. Error 153
48. Error 155
49. Error 157
50. Error 158
51. Error 172
52. Error 173
53. Error 181
54. Error 183
55. Error 184
56. Error 185
57. Error 188
58. Error 190
59. Error 191
60. Error 192

---

### INCOMPLETE_CODE (58 errors)

**Example:**

```typescript
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();
```

**Fix suggestions:**
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 2
2. Error 4
3. Error 8
4. Error 10
5. Error 13
6. Error 16
7. Error 17
8. Error 18
9. Error 19
10. Error 22
11. Error 24
12. Error 29
13. Error 31
14. Error 39
15. Error 40
16. Error 41
17. Error 42
18. Error 66
19. Error 75
20. Error 77
21. Error 78
22. Error 83
23. Error 84
24. Error 85
25. Error 88
26. Error 90
27. Error 91
28. Error 92
29. Error 100
30. Error 106
31. Error 107
32. Error 108
33. Error 118
34. Error 121
35. Error 122
36. Error 126
37. Error 128
38. Error 131
39. Error 133
40. Error 135
41. Error 139
42. Error 140
43. Error 148
44. Error 150
45. Error 154
46. Error 156
47. Error 161
48. Error 162
49. Error 163
50. Error 164
51. Error 176
52. Error 177
53. Error 180
54. Error 182
55. Error 187
56. Error 189
57. Error 196
58. Error 197

---

### SYNTAX_ERROR (41 errors)

**Example:**

```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.

**All errors in this category:**
1. Error 14
2. Error 15
3. Error 20
4. Error 21
5. Error 43
6. Error 44
7. Error 47
8. Error 48
9. Error 49
10. Error 50
11. Error 51
12. Error 52
13. Error 56
14. Error 57
15. Error 58
16. Error 59
17. Error 68
18. Error 70
19. Error 73
20. Error 74
21. Error 81
22. Error 82
23. Error 86
24. Error 87
25. Error 97
26. Error 98
27. Error 109
28. Error 110
29. Error 111
30. Error 141
31. Error 142
32. Error 159
33. Error 160
34. Error 165
35. Error 166
36. Error 174
37. Error 175
38. Error 178
39. Error 179
40. Error 194
41. Error 195

---

### UNDECLARED_VARIABLE (8 errors)

**Example:**

```typescript
const fn = Result.ok<(a: string) => (b: string) => (c: string) => string, string>(curriedMerge);

```

**Fix suggestions:**
- Add import: import Result from "true-myth/result";

**All errors in this category:**
1. Error 28
2. Error 35
3. Error 94
4. Error 113
5. Error 114
6. Error 138
7. Error 186
8. Error 193

---

### INCOMPLETE_CODE, UNDECLARED_VARIABLE (5 errors)

**Example:**

```typescript
const foo = document.querySelector('#foo');
let width: number;
if (foo !== null) {
  width = foo.getBoundingClientRect().width;
} else {
```

**Fix suggestions:**
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 36
2. Error 119
3. Error 124
4. Error 132
5. Error 171

---

### SYNTAX_ERROR, UNDECLARED_VARIABLE (9 errors)

**Example:**

```typescript
type Person = { name?: string };

const me: Person = { name: 'Chris' };
console.log(Maybe.property('name', me)); // Just('Chris')

```

**Fix suggestions:**
- Add import: import Maybe from "true-myth/maybe";
- Fix syntax errors - missing semicolons, braces, etc.

**All errors in this category:**
1. Error 60
2. Error 61
3. Error 62
4. Error 63
5. Error 112
6. Error 167
7. Error 168
8. Error 169
9. Error 170

---

### INCOMPLETE_CODE, SYNTAX_ERROR (12 errors)

**Example:**

```typescript
import { just, map, type Just } from 'true-myth/maybe';

const anObjectToWrap = {
  desc: ['this', ' ', 'is a string'],
  val: 42,
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 76
2. Error 101
3. Error 102
4. Error 103
5. Error 104
6. Error 105
7. Error 136
8. Error 137
9. Error 143
10. Error 144
11. Error 145
12. Error 146

---

### INCOMPLETE_CODE, SYNTAX_ERROR, UNDECLARED_VARIABLE (2 errors)

**Example:**

```typescript
usersTask.match({
  Resolved: (users) => {
    for (let user of users) {
      const today = new Date();
      console.log("Hello,", user.name ?? "someone", "!");
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 93
2. Error 117

---

### SYNTAX_ERROR, UNDECLARED_VARIABLE, UNDECLARED_VARIABLE, UNDECLARED_VARIABLE (2 errors)

**Example:**

```typescript
let theTask = Task.resolve(123);
let doubled = theTask.map((n) => n * 2);
let theResult = await doubled;
console.log(theResult); // Ok(456)

```

**Fix suggestions:**
- Add import for map function from appropriate module
- Fix syntax errors - missing semicolons, braces, etc.

**All errors in this category:**
1. Error 115
2. Error 116

---

