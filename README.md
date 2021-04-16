# auto-assign-team
Github Action that auto-assigs a team as a PR reviewer

## Example usage
Create a workflow file (e.g. `.github/workflows/auto-assign-team.yml`) that contains a step that `uses: barisaydinoglu/auto-assign-team`.
Example:

```yaml
name: AutoAssignTeam
on:
  pull_request:
    types: [opened, ready_for_review]
  pull_request_review:
jobs:
  auto-assign-team:
    runs-on: ubuntu-latest
    steps:
      - name: Run assignment of reviewer team
        uses: barisaydinoglu/auto-assign-team
        with:
          approvals: 2
          github-token: ${{ secrets.GITHUB_TOKEN }}
          team-name: 'my-team-name'
```
