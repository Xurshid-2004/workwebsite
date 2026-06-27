"""Seed the database with realistic Uzbekistan-market demo data.

Usage:
    python manage.py seed                # idempotent top-up
    python manage.py seed --flush        # wipe jobs/users/etc first
    python manage.py seed --jobs 200     # scale the job volume
"""
import random
from urllib.parse import quote

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from jobs.models import Category, Job, Location
from social.models import Application, Favorite, Notification

User = get_user_model()

CATEGORIES = [
    ('IT va Dasturlash', 'it-dasturlash', 'Code', 1),
    ('Marketing', 'marketing', 'Megaphone', 2),
    ('Sotuv', 'sotuv', 'ShoppingBag', 3),
    ('Dizayn', 'dizayn', 'PenTool', 4),
    ('Logistika', 'logistika', 'Truck', 5),
    ('Qurilish', 'qurilish', 'HardHat', 6),
    ("Ta'lim", 'talim', 'GraduationCap', 7),
    ('Tibbiyot', 'tibbiyot', 'Stethoscope', 8),
    ('Restoran va Xizmat', 'restoran-xizmat', 'UtensilsCrossed', 9),
    ('Buxgalteriya', 'buxgalteriya', 'Calculator', 10),
]

# (label, region, lat, lng) — district / city centers across Uzbekistan.
LOCATIONS = [
    ('Toshkent, Chilonzor', 'Toshkent', 41.2756, 69.2035),
    ('Toshkent, Yunusobod', 'Toshkent', 41.3640, 69.2894),
    ("Toshkent, Mirzo Ulug'bek", 'Toshkent', 41.3253, 69.3340),
    ('Toshkent, Yakkasaroy', 'Toshkent', 41.2848, 69.2417),
    ('Toshkent, Shayxontohur', 'Toshkent', 41.3231, 69.2256),
    ('Toshkent, Sergeli', 'Toshkent', 41.2244, 69.2206),
    ('Toshkent, Olmazor', 'Toshkent', 41.3553, 69.2030),
    ('Toshkent, Mirobod', 'Toshkent', 41.2920, 69.2790),
    ('Toshkent, Yashnobod', 'Toshkent', 41.2870, 69.3360),
    ('Samarqand', 'Samarqand', 39.6270, 66.9750),
    ('Buxoro', 'Buxoro', 39.7680, 64.4210),
    ('Andijon', 'Andijon', 40.7821, 72.3442),
    ('Namangan', 'Namangan', 40.9983, 71.6726),
    ("Farg'ona", "Farg'ona", 40.3864, 71.7864),
    ('Nukus', "Qoraqalpog'iston", 42.4731, 59.6103),
    ('Qarshi', 'Qashqadaryo', 38.8606, 65.7891),
    ('Termiz', 'Surxondaryo', 37.2242, 67.2783),
    ('Urganch', 'Xorazm', 41.5500, 60.6333),
    ('Navoiy', 'Navoiy', 40.0844, 65.3792),
    ('Jizzax', 'Jizzax', 40.1158, 67.8422),
    ('Guliston', 'Sirdaryo', 40.4897, 68.7842),
]

COMPANIES = [
    'Uzum Technologies', 'Click Evolution', 'EPAM Uzbekistan', 'IT Park Solutions',
    'Korzinka', 'Artel Electronics', 'Humans', 'Beeline Uzbekistan', 'Payme',
    'TBC Bank UZ', 'Anor Bank', 'Express24', 'Yandex Go UZ', 'MyTaxi',
    'Akfa Group', 'Enter Engineering', 'Texnomart', 'Mediapark', 'Oson',
    'Davr Bank',
]

# (title, category_slug, work_type, schedule_type, schedule_pattern, [skills], salary_min, salary_max)
JOB_TEMPLATES = [
    ('Frontend Dasturchi (React)', 'it-dasturlash', 'hybrid', 'full-time', 'standard', ['React', 'TypeScript', 'Next.js'], 700, 1800),
    ('Backend Dasturchi (Python/Django)', 'it-dasturlash', 'remote', 'full-time', 'standard', ['Python', 'Django', 'PostgreSQL'], 900, 2200),
    ('Mobil Dasturchi (Flutter)', 'it-dasturlash', 'onsite', 'full-time', 'standard', ['Flutter', 'Dart'], 800, 2000),
    ('QA Engineer', 'it-dasturlash', 'hybrid', 'full-time', 'standard', ['Testing', 'Automation'], 600, 1400),
    ('DevOps Engineer', 'it-dasturlash', 'remote', 'contract', 'flexible-hours', ['Docker', 'CI/CD', 'AWS'], 1000, 2500),
    ('SMM Menejer', 'marketing', 'onsite', 'full-time', 'standard', ['Instagram', 'Targeting'], 350, 800),
    ('Marketing Boshqaruvchisi', 'marketing', 'onsite', 'full-time', 'standard', ['Strategy', 'Analytics'], 600, 1500),
    ('Content Creator', 'marketing', 'hybrid', 'part-time', 'flexible-hours', ['Copywriting', 'Video'], 300, 700),
    ('Savdo Menejeri', 'sotuv', 'onsite', 'full-time', 'standard', ['Sales', 'CRM'], 400, 1000),
    ('Call-markaz operatori', 'sotuv', 'onsite', 'part-time', 'night-shift', ['Communication'], 250, 500),
    ('UI/UX Dizayner', 'dizayn', 'remote', 'full-time', 'standard', ['Figma', 'Prototyping'], 600, 1500),
    ('Grafik Dizayner', 'dizayn', 'hybrid', 'freelance', 'flexible-hours', ['Photoshop', 'Illustrator'], 400, 1000),
    ('Yetkazib beruvchi (Kuryer)', 'logistika', 'onsite', 'part-time', 'flexible-hours', ['Driving'], 300, 700),
    ('Ombor menejeri', 'logistika', 'onsite', 'full-time', 'standard', ['Inventory'], 400, 900),
    ('Quruvchi-usta', 'qurilish', 'onsite', 'contract', 'standard', ['Construction'], 500, 1200),
    ('Prorab', 'qurilish', 'onsite', 'full-time', 'standard', ['Management'], 700, 1600),
    ("Ingliz tili o'qituvchisi", 'talim', 'onsite', 'part-time', 'weekends', ['English', 'IELTS'], 300, 900),
    ('Matematika repetitori', 'talim', 'hybrid', 'freelance', 'flexible-hours', ['Math'], 250, 700),
    ('Hamshira', 'tibbiyot', 'onsite', 'full-time', 'night-shift', ['Nursing'], 300, 600),
    ('Stomatolog', 'tibbiyot', 'onsite', 'full-time', 'standard', ['Dentistry'], 800, 2000),
    ('Oshpaz', 'restoran-xizmat', 'onsite', 'full-time', 'standard', ['Cooking'], 350, 800),
    ('Ofitsiant', 'restoran-xizmat', 'onsite', 'part-time', 'night-shift', ['Service'], 200, 450),
    ('Barista', 'restoran-xizmat', 'onsite', 'part-time', 'flexible-hours', ['Coffee'], 250, 500),
    ('Bosh buxgalter', 'buxgalteriya', 'onsite', 'full-time', 'standard', ['1C', 'Tax'], 700, 1500),
    ('Buxgalter yordamchisi', 'buxgalteriya', 'hybrid', 'full-time', 'standard', ['Excel', '1C'], 350, 800),
]

DESCRIPTION = (
    "Tez rivojlanayotgan jamoaga professional mutaxassis qidirilmoqda. "
    "Siz mas'uliyatli, natijaga yo'naltirilgan va o'rganishga tayyor bo'lishingiz kerak. "
    "Biz qulay ish sharoiti, raqobatbardosh maosh va kasbiy o'sish imkoniyatini taklif qilamiz."
)
RESPONSIBILITIES = [
    'Kundalik vazifalarni sifatli va o‘z vaqtida bajarish',
    'Jamoa bilan samarali hamkorlik qilish',
    'Natijalar bo‘yicha hisobot tayyorlash',
]
REQUIREMENTS = [
    'Tegishli sohada tajriba (1 yildan ortiq afzal)',
    'Mas‘uliyatlilik va intizomlilik',
    'O‘zbek tilini yaxshi bilish, rus/ingliz tili afzallik',
]


def logo_for(company: str) -> str:
    return f'https://ui-avatars.com/api/?background=2563eb&color=fff&bold=true&name={quote(company)}'


class Command(BaseCommand):
    help = 'Seed demo data for the IshTop job marketplace (Uzbekistan).'

    def add_arguments(self, parser):
        parser.add_argument('--flush', action='store_true', help='Wipe seeded data first')
        parser.add_argument('--jobs', type=int, default=60, help='Number of jobs to generate')
        parser.add_argument('--password', type=str, default='Parol123!', help='Demo account password')

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(42)
        password = options['password']

        if options['flush']:
            self.stdout.write('Flushing seeded data...')
            Application.objects.all().delete()
            Favorite.objects.all().delete()
            Notification.objects.all().delete()
            Job.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        categories = {}
        for name, slug, icon, order in CATEGORIES:
            cat, _ = Category.objects.update_or_create(
                slug=slug, defaults={'name': name, 'icon': icon, 'order': order}
            )
            categories[slug] = cat

        locations = []
        for label, region, lat, lng in LOCATIONS:
            loc, _ = Location.objects.update_or_create(
                slug=slugify(label),
                defaults={'label': label, 'region': region, 'lat': lat, 'lng': lng, 'is_active': True},
            )
            locations.append(loc)
        # A virtual "remote" location for fully remote jobs.
        Location.objects.update_or_create(
            slug='masofaviy', defaults={'label': 'Masofaviy', 'region': '', 'is_remote': True}
        )

        admin, created = User.objects.get_or_create(
            username='admin@ishtop.uz',
            defaults={
                'email': 'admin@ishtop.uz', 'first_name': 'Admin', 'role': User.Role.ADMIN,
                'profile_role': User.ProfileRole.BOTH, 'is_staff': True, 'is_superuser': True,
            },
        )
        if created:
            admin.set_password(password)
            admin.save()

        posters = []
        for i, company in enumerate(COMPANIES):
            email = f'hr{i+1}@ishtop.uz'
            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email, 'first_name': f'{company} HR', 'role': User.Role.POSTER,
                    'profile_role': User.ProfileRole.POSTER, 'company_id': slugify(company),
                    'title': 'HR menejer', 'avatar_url': logo_for(company),
                },
            )
            if created:
                user.set_password(password)
                user.save()
            posters.append((user, company))

        seekers = []
        seeker_names = ['Aziz Karimov', 'Dilnoza Yusupova', 'Jasur Toshmatov', 'Malika Olimova', 'Bekzod Rashidov']
        for i, name in enumerate(seeker_names):
            email = f'user{i+1}@ishtop.uz'
            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email, 'first_name': name, 'role': User.Role.SEEKER,
                    'profile_role': User.ProfileRole.SEEKER, 'title': 'Ish izlovchi',
                    'avatar_url': logo_for(name),
                },
            )
            if created:
                user.set_password(password)
                user.save()
            seekers.append(user)

        target = options['jobs']
        created_jobs = 0
        existing = Job.objects.count()
        while created_jobs + existing < target:
            template = rng.choice(JOB_TEMPLATES)
            title, cat_slug, work_type, schedule_type, pattern, skills, smin, smax = template
            poster, company = rng.choice(posters)
            is_remote = work_type == 'remote'
            loc = rng.choice(locations)
            # Jitter coordinates a little so markers don't perfectly overlap.
            lat = None if is_remote else (loc.lat + rng.uniform(-0.02, 0.02) if loc.lat else None)
            lng = None if is_remote else (loc.lng + rng.uniform(-0.02, 0.02) if loc.lng else None)
            salary_min = smin + rng.randint(0, 3) * 50
            salary_max = max(salary_min + 100, smax - rng.randint(0, 3) * 50)
            created_at = timezone.now() - timezone.timedelta(days=rng.randint(0, 30), hours=rng.randint(0, 23))
            job = Job.objects.create(
                title=title,
                company_id=poster.company_id or slugify(company),
                company_name=company,
                company_logo=logo_for(company),
                category=categories[cat_slug],
                poster=poster,
                description=DESCRIPTION,
                responsibilities=RESPONSIBILITIES,
                requirements=REQUIREMENTS,
                status=Job.Status.ACTIVE,
                work_type=work_type,
                schedule_type=schedule_type,
                schedule_pattern=pattern,
                location_label='Masofaviy' if is_remote else loc.label,
                location_city='' if is_remote else loc.region,
                location_country='Uzbekistan',
                location_is_remote=is_remote,
                location_lat=lat,
                location_lng=lng,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency='USD',
                skills=skills,
                is_featured=rng.random() < 0.18,
                contact_phone='+998 90 123 45 67',
                district='' if is_remote else loc.label,
            )
            Job.objects.filter(pk=job.pk).update(created_at=created_at)
            created_jobs += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seed complete: {Category.objects.count()} categories, '
            f'{Location.objects.count()} locations, {User.objects.count()} users, '
            f'{Job.objects.count()} jobs. Demo password: "{password}"'
        ))
