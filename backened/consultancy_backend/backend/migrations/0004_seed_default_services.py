from django.db import migrations


def seed_default_services(apps, schema_editor):
    Service = apps.get_model('backend', 'Service')

    if Service.objects.exists():
        return

    defaults = [
        {
            'title': 'Accounting Services',
            'description': 'Professional accounting and financial management solutions including:',
            'icon_key': 'calculator',
            'service_areas': [
                'Payroll Management',
                'Tax Planning and Filing',
                'Employee Benefits Administration',
                'Financial Reporting',
                'Financial Planning and Analysis',
                'Bookkeeping',
                'Budgeting and Forecasting',
                'Cash Flow Management',
            ],
            'order': 1,
            'is_active': True,
        },
        {
            'title': 'Business Consultancy',
            'description': 'Comprehensive business strategy and operational support services including:',
            'icon_key': 'building2',
            'service_areas': [
                'Business Strategy Development',
                'Business Process Reengineering',
                'Financial Modelling',
                'Business Plan Development',
                'Policy and Procedure Development',
                'Business Expansion Strategies',
                'SME Business Growth Services',
                'Process Improvement',
            ],
            'order': 2,
            'is_active': True,
        },
        {
            'title': 'Marketing Consultancy',
            'description': 'Strategic marketing solutions and market analysis including:',
            'icon_key': 'trendingup',
            'service_areas': [
                'Digital Marketing',
                'Market Entry Strategy',
                'Market Research',
                'Market Access Strategy',
                'Product Launch Strategy',
                'Customer Segmentation and Targeting',
                'Sales and Distribution Strategy',
            ],
            'order': 3,
            'is_active': True,
        },
        {
            'title': 'Technology Services',
            'description': 'Cutting-edge business technology and digital transformation including:',
            'icon_key': 'laptop',
            'service_areas': [
                'Systems Integration (ERP)',
                'IT Infrastructure Management',
                'Software Development',
            ],
            'order': 4,
            'is_active': True,
        },
        {
            'title': 'Investment & Wealth Management',
            'description': 'Comprehensive wealth planning and investment strategies including:',
            'icon_key': 'dollarsign',
            'service_areas': [
                'Investment Advisory',
                'Access to Finance and Funding',
                'Wealth Management',
                'Debt Services',
                'Succession Planning',
                'Property Management',
                'Trust Administration',
            ],
            'order': 5,
            'is_active': True,
        },
        {
            'title': 'NGO and Public Sector Consultancy',
            'description': 'Specialized consultancy for non-profit and public sector organizations including:',
            'icon_key': 'shoppingcart',
            'service_areas': [
                'Project Strategic Planning',
                'Data Analysis',
                'Community Development Planning',
                'Capacity Building Workshops',
                'Sustainability Planning',
            ],
            'order': 6,
            'is_active': True,
        },
    ]

    for item in defaults:
        Service.objects.create(**item)


def unseed_default_services(apps, schema_editor):
    Service = apps.get_model('backend', 'Service')
    default_titles = [
        'Accounting Services',
        'Business Consultancy',
        'Marketing Consultancy',
        'Technology Services',
        'Investment & Wealth Management',
        'NGO and Public Sector Consultancy',
    ]
    Service.objects.filter(title__in=default_titles).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_service'),
    ]

    operations = [
        migrations.RunPython(seed_default_services, unseed_default_services),
    ]
