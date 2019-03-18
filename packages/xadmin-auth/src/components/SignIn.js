import React from 'react'
import { Card, Container, Button } from 'react-bootstrap'
import Icon from 'react-fontawesome'
import { StoreWrap, app } from 'xadmin'
import { Model } from 'xadmin-model'
import ModelForm from 'xadmin-model/lib/components/Form'

import { UserSignIn } from '../models'

const SignInForm = StoreWrap('auth.sign_in')(({ onSignIn }) => {
  const { _t } = app.context
  const { auth } = app.get('config')
  return (
    <Model schema={UserSignIn(app)}>
      <Container>
        <ModelForm 
          onSubmit={onSignIn} option={{ groupSize : { label: { sm: 3 }, control: { sm: 9 } } }}
          componentClass={({ error, children, invalid, handleSubmit, submitting }) => (
            <form className="form-horizontal" onSubmit={handleSubmit}>
              <Card style={{ maxWidth: 450, margin: '5rem auto' }} >
                <Card.Body>
                  <Card.Title className="mb-4">
                    <h4>{_t('Please Login')}</h4>
                  </Card.Title>
                  {children}
                  {error && <strong>{error}</strong>}
                  <Button type="submit" disabled={invalid || submitting} onClick={handleSubmit} block>
                    <Icon name={submitting ? 'spinner fa-spin' : 'sign-in'}/> {_t('Login')}</Button>
                  { auth.can_signup && (<div className="mt-3">{_t('Not registed')}? <a href="#" onClick={()=>app.go('/signup')}>{_t('please signup')}</a></div>) }
                  { auth.can_reset_password && (<div className="mt-3">{_t('Forgot password')}? <a href="#" onClick={()=>app.go('/forget_password')}>{_t('reset password')}</a></div>) }
                </Card.Body>
              </Card>
            </form>
          )
          }
        />
      </Container>
    </Model>
  )
})

export default SignInForm