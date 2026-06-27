from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from jobs.models import Category, Job

User = get_user_model()


class JobApiTests(APITestCase):
    def setUp(self):
        self.cat = Category.objects.create(name='IT', slug='it')
        self.poster = User.objects.create_user(username='p@e.uz', email='p@e.uz', password='Parol123!')
        self.near = self._job('Near job', 41.31, 69.28)  # ~Tashkent
        self.far = self._job('Far job', 39.65, 66.95)  # ~Samarkand (>250km)

    def _job(self, title, lat, lng):
        return Job.objects.create(
            title=title,
            company_name='C',
            category=self.cat,
            poster=self.poster,
            description='d',
            status=Job.Status.ACTIVE,
            work_type='onsite',
            schedule_type='full-time',
            location_label=title,
            location_lat=lat,
            location_lng=lng,
            salary_min=100,
            salary_max=200,
        )

    def test_list_returns_active_jobs(self):
        resp = self.client.get('/api/jobs/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['count'], 2)

    def test_nearby_filters_by_radius_and_orders_by_distance(self):
        resp = self.client.get('/api/jobs/?near=41.2995,69.2401&radius_km=20')
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        titles = [j['title'] for j in results]
        self.assertIn('Near job', titles)
        self.assertNotIn('Far job', titles)
        distances = [j['distance'] for j in results]
        self.assertEqual(distances, sorted(distances))

    def test_category_job_count(self):
        resp = self.client.get('/api/categories/')
        self.assertEqual(resp.status_code, 200)
        it = next(c for c in resp.json() if c['slug'] == 'it')
        self.assertEqual(it['job_count'], 2)

    def test_retrieve_increments_views(self):
        before = self.near.views_count
        self.client.get(f'/api/jobs/{self.near.id}/')
        self.near.refresh_from_db()
        self.assertEqual(self.near.views_count, before + 1)
