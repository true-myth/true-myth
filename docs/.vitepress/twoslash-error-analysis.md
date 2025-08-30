# Twoslash Error Analysis Report

Generated: 2025-08-30T19:42:56.415Z

## Summary

- **Total Errors**: 246
- **Categories**: 11

## Error Categories

### SYNTAX_ERROR (39 errors)

**Example:**

```typescript
import Maybe from 'true-myth/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.

**All errors in this category:**
1. Error 1
2. Error 2
3. Error 12
4. Error 14
5. Error 15
6. Error 17
7. Error 21
8. Error 22
9. Error 24
10. Error 25
11. Error 53
12. Error 54
13. Error 63
14. Error 64
15. Error 85
16. Error 87
17. Error 99
18. Error 100
19. Error 106
20. Error 107
21. Error 119
22. Error 120
23. Error 123
24. Error 124
25. Error 151
26. Error 169
27. Error 170
28. Error 196
29. Error 198
30. Error 199
31. Error 201
32. Error 209
33. Error 210
34. Error 218
35. Error 219
36. Error 220
37. Error 221
38. Error 243
39. Error 244

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
1. Error 3
2. Error 4
3. Error 5
4. Error 6
5. Error 152
6. Error 211
7. Error 212
8. Error 213
9. Error 214

---

### INCOMPLETE_CODE, UNDECLARED_VARIABLE (11 errors)

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
1. Error 7
2. Error 23
3. Error 26
4. Error 32
5. Error 136
6. Error 159
7. Error 164
8. Error 168
9. Error 215
10. Error 222
11. Error 224

---

### OTHER (80 errors)

**Example:**

```typescript
import Maybe from 'true-myth/maybe';

const aWidth = Maybe.of(document.querySelector('#foo'))
  .map(el => el.getBoundingClientRect().width)
  .unwrapOr(0);
```

**Fix suggestions:**

**All errors in this category:**
1. Error 8
2. Error 9
3. Error 18
4. Error 19
5. Error 20
6. Error 27
7. Error 28
8. Error 29
9. Error 33
10. Error 35
11. Error 37
12. Error 38
13. Error 39
14. Error 41
15. Error 43
16. Error 44
17. Error 55
18. Error 57
19. Error 59
20. Error 61
21. Error 71
22. Error 73
23. Error 74
24. Error 75
25. Error 78
26. Error 80
27. Error 81
28. Error 82
29. Error 84
30. Error 86
31. Error 89
32. Error 97
33. Error 98
34. Error 101
35. Error 104
36. Error 105
37. Error 108
38. Error 117
39. Error 118
40. Error 121
41. Error 122
42. Error 131
43. Error 133
44. Error 134
45. Error 138
46. Error 143
47. Error 144
48. Error 145
49. Error 146
50. Error 160
51. Error 163
52. Error 165
53. Error 171
54. Error 173
55. Error 175
56. Error 176
57. Error 177
58. Error 179
59. Error 181
60. Error 182
61. Error 185
62. Error 187
63. Error 189
64. Error 191
65. Error 193
66. Error 194
67. Error 195
68. Error 202
69. Error 203
70. Error 204
71. Error 216
72. Error 217
73. Error 230
74. Error 232
75. Error 233
76. Error 234
77. Error 237
78. Error 239
79. Error 240
80. Error 241

---

### UNDECLARED_VARIABLE, UNDECLARED_VARIABLE (4 errors)

**Example:**

```typescript
const a = Maybe.of(3);
const b = Maybe.of(3);
const c = Maybe.of(null);
const d = Maybe.nothing();

```

**Fix suggestions:**
- Add import: import { nothing } from "true-myth/maybe";
- Add import: import Maybe from "true-myth/maybe";

**All errors in this category:**
1. Error 10
2. Error 11
3. Error 183
4. Error 184

---

### INCOMPLETE_CODE, SYNTAX_ERROR (16 errors)

**Example:**

```typescript
import { get, just } from 'true-myth/maybe';

type Dict<T> = { [key: string]: T };

const score: Maybe<Dict<number>> = just({
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 13
2. Error 16
3. Error 56
4. Error 58
5. Error 60
6. Error 62
7. Error 110
8. Error 128
9. Error 129
10. Error 148
11. Error 186
12. Error 188
13. Error 190
14. Error 192
15. Error 197
16. Error 200

---

### UNDECLARED_VARIABLE (24 errors)

**Example:**

```typescript
const notString = Maybe.nothing<string>();

```

**Fix suggestions:**
- Add import: import Maybe from "true-myth/maybe";

**All errors in this category:**
1. Error 30
2. Error 31
3. Error 45
4. Error 46
5. Error 51
6. Error 52
7. Error 68
8. Error 69
9. Error 76
10. Error 83
11. Error 94
12. Error 95
13. Error 130
14. Error 142
15. Error 153
16. Error 154
17. Error 167
18. Error 223
19. Error 225
20. Error 226
21. Error 227
22. Error 228
23. Error 235
24. Error 242

---

### INCOMPLETE_CODE (52 errors)

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
1. Error 34
2. Error 36
3. Error 40
4. Error 42
5. Error 47
6. Error 48
7. Error 49
8. Error 50
9. Error 65
10. Error 66
11. Error 67
12. Error 70
13. Error 72
14. Error 77
15. Error 79
16. Error 88
17. Error 90
18. Error 91
19. Error 92
20. Error 93
21. Error 109
22. Error 111
23. Error 112
24. Error 113
25. Error 114
26. Error 127
27. Error 132
28. Error 135
29. Error 137
30. Error 139
31. Error 140
32. Error 147
33. Error 149
34. Error 150
35. Error 158
36. Error 161
37. Error 162
38. Error 166
39. Error 172
40. Error 174
41. Error 178
42. Error 180
43. Error 205
44. Error 206
45. Error 207
46. Error 208
47. Error 229
48. Error 231
49. Error 236
50. Error 238
51. Error 245
52. Error 246

---

### INCOMPLETE_CODE, SYNTAX_ERROR, UNDECLARED_VARIABLE (3 errors)

**Example:**

```typescript
let settledTask = allSettled([
  Task.resolve<string, number>("hello"),
  Task.reject<number, boolean>(true),
  Task.resolve<{ fancy: boolean }>, Error>({ fancy: true }),
]);
```

**Fix suggestions:**
- Fix syntax errors - missing semicolons, braces, etc.
- Complete the code example or mark as @noErrors if intentionally incomplete

**All errors in this category:**
1. Error 96
2. Error 141
3. Error 157

---

### SYNTAX_ERROR, UNDECLARED_VARIABLE, UNDECLARED_VARIABLE (6 errors)

**Example:**

```typescript
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
resolveWith("Hello!");

let result = await task.map((s) => s.length);
let length = result.unwrapOr(0);
```

**Fix suggestions:**
- Add import for map function from appropriate module
- Fix syntax errors - missing semicolons, braces, etc.

**All errors in this category:**
1. Error 102
2. Error 103
3. Error 115
4. Error 116
5. Error 125
6. Error 126

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
1. Error 155
2. Error 156

---

