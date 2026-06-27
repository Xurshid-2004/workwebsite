from rest_framework.test import APITestCase


class AuthTests(APITestCase):
    def test_register_login_me_flow(self):
        reg = self.client.post(
            '/api/auth/register/',
            {'name': 'Test User', 'email': 'T@e.uz', 'password': 'Parol123!', 'profile_role': 'seeker'},
            format='json',
        )
        self.assertEqual(reg.status_code, 201)

        login = self.client.post(
            '/api/auth/login/',
            {'email': 't@e.uz', 'password': 'Parol123!'},
            format='json',
        )
        self.assertEqual(login.status_code, 200)
        body = login.json()
        self.assertIn('access', body)
        self.assertIn('user', body)
        self.assertEqual(body['user']['name'], 'Test User')

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {body["access"]}')
        me = self.client.get('/api/auth/me/')
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()['email'], 't@e.uz')

    def test_duplicate_email_rejected(self):
        payload = {'name': 'A', 'email': 'dup@e.uz', 'password': 'Parol123!', 'profile_role': 'both'}
        self.assertEqual(self.client.post('/api/auth/register/', payload, format='json').status_code, 201)
        self.assertEqual(self.client.post('/api/auth/register/', payload, format='json').status_code, 400)
