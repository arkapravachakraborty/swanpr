import { requiredAuth } from '@/features/auth/actions'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { GithubConnectCard } from '@/features/github/components/github-connect-card'
import { getInstallationStatus } from '@/features/github/server/installation'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: "Github App - Dashboard",
}

const DashboardGithubPage = async () => {
    // get the session of the user
    const session = await requiredAuth();
    // check if the user is already connected github app as installation status
    const installation = await getInstallationStatus(session.user.id);



    return (
        <>
            <DashboardHeader
                title="GitHub App"
                description="Install or disconnect the reviewer app on your GitHub account."
            />
            <GithubConnectCard userId={session.user.id} installation={installation} />
        </>
    )
}

export default DashboardGithubPage