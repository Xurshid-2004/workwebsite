from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from jobs.models import Category, Job
from social.models import Application, Favorite, Notification

User = get_user_model()


class SocialTests(APITestCase):
    def setUp(self):
        self.cat = Category.objects.create(name='IT', slug='it')
        self.poster = User.objects.create_user(username='hr@e.uz', email='hr@e.uz', password='Parol123!')
        self.seeker = User.objects.create_user(username='s@e.uz', email='s@e.uz', password='Parol123!')
        self.job = Job.objects.create(
            title='Dev', company_name='C', category=self.cat, poster=self.poster,
            description='d', status=Job.Status.ACTIVE, work_type='remote', schedule_type='full-time',
            location_label='Remote', salary_min=1, salary_max=2,
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_favorite_is_idempotent(self):
        self.auth(self.seeker)
        r1 = self.client.post('/api/favorites/', {'job_id': self.job.id}, format='json')
        self.assertEqual(r1.status_code, 201)
        self.client.post('/api/favorites/', {'job_id': self.job.id}, format='json')
        self.assertEqual(Favorite.objects.filter(user=self.seeker).count(), 1)

    def test_apply_creates_notification_and_blocks_duplicates(self):
        self.auth(self.seeker)
        r = self.client.post('/api/applications/', {'job_id': self.job.id, 'cover_note': 'hi'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertTrue(
            Notification.objects.filter(user=self.poster, kind=Notification.Kind.APPLICATION).exists()
        )
        dup = self.client.post('/api/applications/', {'job_id': self.job.id}, format='json')
        self.assertEqual(dup.status_code, 400)

    def test_poster_cannot_apply_to_own_job(self):
        self.auth(self.poster)
        r = self.client.post('/api/applications/', {'job_id': self.job.id}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_chat_start_and_message(self):
        self.auth(self.seeker)
        start = self.client.post('/api/chats/start/', {'job_id': self.job.id}, format='json')
        self.assertIn(start.status_code, (200, 201))
        chat_id = start.json()['id']
        msg = self.client.post(f'/api/chats/{chat_id}/messages/', {'body': 'Salom'}, format='json')
        self.assertEqual(msg.status_code, 201)
        self.assertEqual(Application.objects.count(), 0)  # sanity: messaging != applying
