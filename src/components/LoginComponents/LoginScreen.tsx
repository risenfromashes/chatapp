import React from 'react'
import { Tabs, Tab, Card, TabId } from '@blueprintjs/core'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { render } from 'react-dom'

export class LoginScreen extends React.Component<{}, { tab: TabId }> {
    constructor(props: {}) {
        super(props)
        this.state = { tab: 'Login' }
    }
    private handleTabChange = (newTab: TabId) => {
        this.setState({ tab: newTab })
    }
    render() {
        return (
            <div
                className='w-100 d-flex flex-wrap justify-content-center'
                style={{ height: '100vh' }}
            >
                <Card
                    className='col-10 col-sm-6 col-md-5 col-lg-4 my-5'
                    style={{ height: '40vh' }}
                >
                    <Tabs
                        id='LoginTabs'
                        selectedTabId={this.state.tab}
                        onChange={this.handleTabChange}
                    >
                        <Tab id='Login' title='Login' panel={<LoginForm />} />
                        <Tab
                            id='Register'
                            title='Register'
                            panel={<RegisterForm />}
                        />
                    </Tabs>
                </Card>
            </div>
        )
    }
}
