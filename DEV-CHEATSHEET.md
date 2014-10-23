# Commit style:

`[#<issue1>, #<issue2>, ... ]<type>(<scope>): <hint>`

### Issue:

Related bugs should be listed at the beginning of comment.

### Type:

1. feature - used when adding a new functionality;
1. fix - if any serious bug fixed;
1. docs - changes to the documentation;
1. typo - fix typos and formatting;
1. refactor - code refactoring;
1. test - changes to the test suite;
1. chore - code maintenance.

### Scope

Scope could be anything specifying place of the commit change.

### Hint

Use imperative, present tense: “change” not “changed” nor “changes”.
Don't capitalize first letter.
No dot (.) at the end.

### Several changes in single commit

Join comments with '\n'.

### Examples:

```
feature(core): add Jade template engine
#2647 fix(router): fix routing when request method passed in lowercase
```
