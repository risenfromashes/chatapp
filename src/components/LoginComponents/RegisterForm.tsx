import React, { FormEvent, useEffect, useState } from 'react'
import { FormGroup, InputGroup, Label, Button } from '@blueprintjs/core'

export const RegisterForm = () => {
    const [usernameInput, setUsernameInputValue] = useState('')
    const [passwordInput, setPasswordInputValue] = useState('')

    useEffect(() => {}, [usernameInput])

    function usernameInputChange(e: FormEvent) {
        const target = e.target as HTMLInputElement
        setUsernameInputValue(target.value)
    }
    function passwordInputChange(e: FormEvent) {
        const target = e.target as HTMLInputElement
        setPasswordInputValue(target.value)
    }

    function submit() {
        console.log({ usernameInput, passwordInput })

        fetch('/register', {
            method: 'POST',
            mode: 'same-origin',
            redirect: 'follow',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        })
            .then(res => {
                if (res.status == 302) window.location.assign('/')
                //else showAlert()
            })
            .catch(err => {
                console.log(err)
            })
    }

    //for enter to submit
    if (process.env.BROWSER) {
        window.onkeypress = (e: KeyboardEvent) => {
            if (!e.shiftKey && !e.ctrlKey && e.keyCode == 13) submit()
        }
    }
    return (
        <div className='d-flex flex-column'>
            <FormGroup
                label='Username'
                labelFor='text-input'
                labelInfo='(required)'
            >
                <InputGroup
                    type='text'
                    leftIcon='user'
                    value={usernameInput}
                    onChange={usernameInputChange}
                    placeholder='Enter your username here'
                />
            </FormGroup>
            <FormGroup
                helperText='You can leave the password field empty if you think that extra step and security is unnecessary'
                label='Password'
                labelFor='text-input'
                labelInfo='(optional)'
            >
                <InputGroup
                    type='password'
                    leftIcon='lock'
                    value={passwordInput}
                    onChange={passwordInputChange}
                    placeholder='Enter your pin/password (6-20 characters)'
                />
            </FormGroup>
            <Button
                text='Register'
                className='ml-auto'
                intent='primary'
                onClick={submit}
                large
            />
        </div>
    )
}
