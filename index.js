const github = require('@actions/github')
const core = require('@actions/core')

async function run() {
    try {
        const { eventName, payload, repo } = github.context
        if (eventName !== 'pull_request' && eventName !== 'pull_request_review') {
            core.setFailed(`Invalid event: ${eventName}, it should be use on pull_request or pull_request_review`)
        }
        const githubToken = core.getInput('github-token')
        const requiredApprovals = Number.parseInt(core.getInput('approvals'), 10)
        if (Number.isNaN(requiredApprovals) || requiredApprovals < 1) {
            core.setFailed(`Invalid input count of input.approvals`)
        }
        const teamName = core.getInput('team-name')
        if (!teamName) {
            core.setFailed(`Invalid input of input.team-name`)
        }
        const { pull_request: pr } = payload

        if (pr.draft) {
            core.info(`PR is draft`)
            return
        }
        if (isTeamAssigned(pr, teamName)) {
            core.info(`Team already assigned`)
            return
        }
        const octokit = new github.GitHub(githubToken)
        const { data: reviews } = await octokit.pulls.listReviews({
            owner: repo.owner,
            repo: repo.repo,
            pull_number: pr.number
        })
        if (hasRequiredApprovals(reviews, requiredApprovals)) {
            core.info(`Already has enough reviews`)
            return
        }
        const { data: reviewRequest } = await octokit.pulls.createReviewRequest({
            owner: repo.owner,
            repo: repo.repo,
            pull_number: pr.number,
            team_reviewers: [teamName]
        })
        core.info(`Response: `)
        core.info(JSON.stringify(reviewRequest))
        core.info(`Review Request done...`)
    } catch (e) {
        core.setFailed(`Exception: ${e}`)
    }
}

function isTeamAssigned(pr, teamName) {
    return pr.requested_teams.find(t => t.slug === teamName) !== undefined
}

function hasRequiredApprovals(reviews, approvals) {
    const uniqueReviwerCount = [...new Set(reviews.map(review => review.user.id))].length
    return uniqueReviwerCount >= approvals
}

run().catch((reason) => {
    core.setFailed(`Exception: ${reason}`)
})
