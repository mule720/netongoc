import graphene
from django.contrib.auth import authenticate, get_user_model, login, logout
from graphene_django import DjangoObjectType
from .models import ContactRequest, Property, HeroImage, ConsultancyRequest, Service, HeroContent, CompanyUpdate, Client, CompanyStats, ConsultancyPlan, ConsultancyPlanTask


class ContactRequestType(DjangoObjectType):
    class Meta:
        model = ContactRequest
        fields = ('id', 'name', 'email', 'phone', 'message', 'created_at')


class PropertyType(DjangoObjectType):
    class Meta:
        model = Property
        fields = (
            'id',
            'title',
            'description',
            'property_type',
            'price',
            'address',
            'latitude',
            'longitude',
            'bedrooms',
            'bathrooms',
            'square_feet',
            'image_url',
            'created_at',
            'updated_at'
        )


class HeroImageType(DjangoObjectType):
    class Meta:
        model = HeroImage
        fields = ('id', 'title', 'description', 'image_url', 'order', 'is_active', 'created_at', 'updated_at')


class ConsultancyRequestType(DjangoObjectType):
    class Meta:
        model = ConsultancyRequest
        fields = ('id', 'name', 'email', 'company', 'phone', 'service', 'message', 'status', 'created_at', 'updated_at')


class ConsultancyPlanType(DjangoObjectType):
    class Meta:
        model = ConsultancyPlan
        fields = ('id', 'consultancy_request', 'title', 'created_at', 'updated_at')


class ConsultancyPlanTaskType(DjangoObjectType):
    class Meta:
        model = ConsultancyPlanTask
        fields = ('id', 'plan', 'task_title', 'due_date', 'is_completed', 'order', 'created_at', 'updated_at')


class ServiceType(DjangoObjectType):
    class Meta:
        model = Service
        fields = (
            'id',
            'title',
            'description',
            'icon_key',
            'service_areas',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        )


class HeroContentType(DjangoObjectType):
    class Meta:
        model = HeroContent
        fields = (
            'id',
            'tagline',
            'heading',
            'description',
            'cta_text',
            'background_image_url',
            'overlay_color',
            'overlay_opacity',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        )


class CompanyUpdateType(DjangoObjectType):
    class Meta:
        model = CompanyUpdate
        fields = ('id', 'title', 'content', 'image_url', 'is_published', 'created_at', 'updated_at')


class ClientType(DjangoObjectType):
    class Meta:
        model = Client
        fields = ('id', 'name', 'logo', 'industry', 'is_featured', 'created_at', 'updated_at')


class CompanyStatsType(DjangoObjectType):
    class Meta:
        model = CompanyStats
        fields = ('id', 'client_satisfaction', 'years_experience', 'updated_at')


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'username', 'is_staff')


class Query(graphene.ObjectType):
    contact_requests = graphene.List(ContactRequestType)
    consultancy_requests = graphene.List(ConsultancyRequestType)
    consultancy_plan = graphene.Field(ConsultancyPlanType, consultancy_id=graphene.ID(required=True))
    consultancy_plan_tasks = graphene.List(ConsultancyPlanTaskType, consultancy_id=graphene.ID(required=True))
    properties = graphene.List(PropertyType)
    property_by_id = graphene.Field(PropertyType, id=graphene.ID(required=True))
    hero_images = graphene.List(HeroImageType)
    hero_image_by_id = graphene.Field(HeroImageType, id=graphene.ID(required=True))
    services = graphene.List(ServiceType, include_inactive=graphene.Boolean(default_value=False))
    hero_contents = graphene.List(HeroContentType, include_inactive=graphene.Boolean(default_value=False))
    active_hero_content = graphene.Field(HeroContentType)
    company_updates = graphene.List(CompanyUpdateType, published=graphene.Boolean(default_value=False))
    clients = graphene.List(ClientType, featured=graphene.Boolean(default_value=False))
    company_stats = graphene.Field(CompanyStatsType)
    companies_served = graphene.Int()
    me = graphene.Field(UserType)

    def resolve_company_updates(self, info, published=False):
        qs = CompanyUpdate.objects.order_by('-created_at')
        if published:
            qs = qs.filter(is_published=True)
        return qs

    def resolve_clients(self, info, featured=False):
        qs = Client.objects.order_by('name')
        if featured:
            qs = qs.filter(is_featured=True)
        return qs

    def resolve_company_stats(self, info):
        stats, _ = CompanyStats.objects.get_or_create(
            id=1,
            defaults={'client_satisfaction': '98%', 'years_experience': '15+'},
        )
        return stats

    def resolve_companies_served(self, info):
        return Client.objects.count()

    def resolve_contact_requests(self, info):
        return ContactRequest.objects.order_by('-created_at').all()

    def resolve_consultancy_requests(self, info):
        return ConsultancyRequest.objects.order_by('-created_at').all()

    def resolve_consultancy_plan(self, info, consultancy_id):
        try:
            req = ConsultancyRequest.objects.get(id=consultancy_id)
        except ConsultancyRequest.DoesNotExist:
            return None
        plan, _ = ConsultancyPlan.objects.get_or_create(consultancy_request=req, defaults={'title': 'Project Plan'})
        return plan

    def resolve_consultancy_plan_tasks(self, info, consultancy_id):
        try:
            req = ConsultancyRequest.objects.get(id=consultancy_id)
        except ConsultancyRequest.DoesNotExist:
            return []
        plan, _ = ConsultancyPlan.objects.get_or_create(consultancy_request=req, defaults={'title': 'Project Plan'})
        return ConsultancyPlanTask.objects.filter(plan=plan).order_by('order', 'due_date', 'created_at')

    def resolve_properties(self, info):
        return Property.objects.order_by('-created_at').all()

    def resolve_property_by_id(self, info, id):
        try:
            return Property.objects.get(id=id)
        except Property.DoesNotExist:
            return None

    def resolve_hero_images(self, info):
        return HeroImage.objects.filter(is_active=True).order_by('order').all()

    def resolve_hero_image_by_id(self, info, id):
        try:
            return HeroImage.objects.get(id=id)
        except HeroImage.DoesNotExist:
            return None

    def resolve_services(self, info, include_inactive=False):
        queryset = Service.objects.order_by('order', 'created_at')
        if include_inactive:
            return queryset.all()
        return queryset.filter(is_active=True)

    def resolve_hero_contents(self, info, include_inactive=False):
        queryset = HeroContent.objects.order_by('order', '-created_at')
        if include_inactive:
            return queryset.all()
        return queryset.filter(is_active=True)

    def resolve_active_hero_content(self, info):
        return HeroContent.objects.filter(is_active=True).order_by('order', '-created_at').first()

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None


class CreateContactRequest(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        phone = graphene.String()
        message = graphene.String()

    contact = graphene.Field(ContactRequestType)

    def mutate(self, info, name, email, phone=None, message=None):
        contact = ContactRequest.objects.create(name=name, email=email, phone=phone or '', message=message or '')
        return CreateContactRequest(contact=contact)


class RegisterUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        password_confirm = graphene.String(required=True)
        name = graphene.String()

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, email, password, password_confirm, name=None):
        if password != password_confirm:
            return RegisterUser(user=None, success=False, message='Passwords do not match.')
        
        User = get_user_model()
        if User.objects.filter(email=email).exists():
            return RegisterUser(user=None, success=False, message='Email already registered.')

        username = name or email
        user = User.objects.create_user(username=username, email=email, password=password)
        login(info.context, user)
        return RegisterUser(user=user, success=True, message='Registered successfully.')


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, email, password):
        User = get_user_model()
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return LoginUser(user=None, success=False, message='Invalid credentials.')

        user = authenticate(info.context, username=user_obj.username, password=password)
        if user is None:
            return LoginUser(user=None, success=False, message='Invalid credentials.')

        login(info.context, user)
        return LoginUser(user=user, success=True, message='Logged in successfully.')


class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info):
        if info.context.user.is_authenticated:
            logout(info.context)
            return LogoutUser(success=True, message='Logged out successfully.')
        return LogoutUser(success=False, message='Not authenticated.')


class CreateProperty(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        property_type = graphene.String(required=True)
        price = graphene.Float()
        address = graphene.String(required=True)
        latitude = graphene.Float(required=True)
        longitude = graphene.Float(required=True)
        bedrooms = graphene.Int()
        bathrooms = graphene.Int()
        square_feet = graphene.Int()
        image_url = graphene.String()

    property_obj = graphene.Field(PropertyType)

    def mutate(
        self,
        info,
        title,
        property_type,
        address,
        latitude,
        longitude,
        description=None,
        price=None,
        bedrooms=None,
        bathrooms=None,
        square_feet=None,
        image_url=None
    ):
        property_obj = Property.objects.create(
            title=title,
            description=description or '',
            property_type=property_type,
            price=price,
            address=address,
            latitude=latitude,
            longitude=longitude,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            square_feet=square_feet,
            image_url=image_url
        )
        return CreateProperty(property_obj=property_obj)


class UpdateProperty(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        property_type = graphene.String()
        price = graphene.Float()
        address = graphene.String()
        latitude = graphene.Float()
        longitude = graphene.Float()
        bedrooms = graphene.Int()
        bathrooms = graphene.Int()
        square_feet = graphene.Int()
        image_url = graphene.String()

    property_obj = graphene.Field(PropertyType)

    def mutate(
        self,
        info,
        id,
        title=None,
        description=None,
        property_type=None,
        price=None,
        address=None,
        latitude=None,
        longitude=None,
        bedrooms=None,
        bathrooms=None,
        square_feet=None,
        image_url=None
    ):
        try:
            property_obj = Property.objects.get(id=id)
            
            if title is not None:
                property_obj.title = title
            if description is not None:
                property_obj.description = description
            if property_type is not None:
                property_obj.property_type = property_type
            if price is not None:
                property_obj.price = price
            if address is not None:
                property_obj.address = address
            if latitude is not None:
                property_obj.latitude = latitude
            if longitude is not None:
                property_obj.longitude = longitude
            if bedrooms is not None:
                property_obj.bedrooms = bedrooms
            if bathrooms is not None:
                property_obj.bathrooms = bathrooms
            if square_feet is not None:
                property_obj.square_feet = square_feet
            if image_url is not None:
                property_obj.image_url = image_url
            
            property_obj.save()
            return UpdateProperty(property_obj=property_obj)
        except Property.DoesNotExist:
            return UpdateProperty(property_obj=None)


class DeleteProperty(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            property_obj = Property.objects.get(id=id)
            property_obj.delete()
            return DeleteProperty(success=True)
        except Property.DoesNotExist:
            return DeleteProperty(success=False)


class CreateHeroImage(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        image_url = graphene.String(required=True)
        order = graphene.Int()

    hero_image = graphene.Field(HeroImageType)

    def mutate(self, info, title, image_url, description=None, order=None):
        hero_image = HeroImage.objects.create(
            title=title,
            description=description or '',
            image_url=image_url,
            order=order or 0
        )
        return CreateHeroImage(hero_image=hero_image)


class UpdateHeroImage(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        image_url = graphene.String()
        order = graphene.Int()
        is_active = graphene.Boolean()

    hero_image = graphene.Field(HeroImageType)

    def mutate(self, info, id, title=None, description=None, image_url=None, order=None, is_active=None):
        try:
            hero_image = HeroImage.objects.get(id=id)
            if title is not None:
                hero_image.title = title
            if description is not None:
                hero_image.description = description
            if image_url is not None:
                hero_image.image_url = image_url
            if order is not None:
                hero_image.order = order
            if is_active is not None:
                hero_image.is_active = is_active
            hero_image.save()
            return UpdateHeroImage(hero_image=hero_image)
        except HeroImage.DoesNotExist:
            return UpdateHeroImage(hero_image=None)


class DeleteHeroImage(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            hero_image = HeroImage.objects.get(id=id)
            hero_image.delete()
            return DeleteHeroImage(success=True)
        except HeroImage.DoesNotExist:
            return DeleteHeroImage(success=False)


class CreateConsultancyRequest(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        company = graphene.String()
        phone = graphene.String()
        service = graphene.String(required=True)
        message = graphene.String()

    consultancy_request = graphene.Field(ConsultancyRequestType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, name, email, service, company=None, phone=None, message=None):
        consultancy_request = ConsultancyRequest.objects.create(
            name=name,
            email=email,
            company=company or '',
            phone=phone or '',
            service=service,
            message=message or ''
        )
        return CreateConsultancyRequest(
            consultancy_request=consultancy_request,
            success=True,
            message='Consultancy request submitted successfully.'
        )


class UpdateConsultancyRequestStatus(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        status = graphene.String(required=True)

    consultancy_request = graphene.Field(ConsultancyRequestType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, status):
        try:
            consultancy_request = ConsultancyRequest.objects.get(id=id)
            consultancy_request.status = status
            consultancy_request.save()
            return UpdateConsultancyRequestStatus(
                consultancy_request=consultancy_request,
                success=True,
                message='Status updated successfully.'
            )
        except ConsultancyRequest.DoesNotExist:
            return UpdateConsultancyRequestStatus(
                consultancy_request=None,
                success=False,
                message='Consultancy request not found.'
            )


class EnsureConsultancyPlan(graphene.Mutation):
    class Arguments:
        consultancy_id = graphene.ID(required=True)
        title = graphene.String()

    plan = graphene.Field(ConsultancyPlanType)
    success = graphene.Boolean()

    def mutate(self, info, consultancy_id, title=None):
        try:
            req = ConsultancyRequest.objects.get(id=consultancy_id)
        except ConsultancyRequest.DoesNotExist:
            return EnsureConsultancyPlan(plan=None, success=False)

        plan, _ = ConsultancyPlan.objects.get_or_create(consultancy_request=req, defaults={'title': title or 'Project Plan'})
        if title is not None and title.strip():
            plan.title = title.strip()
            plan.save()
        return EnsureConsultancyPlan(plan=plan, success=True)


class CreateConsultancyPlanTask(graphene.Mutation):
    class Arguments:
        consultancy_id = graphene.ID(required=True)
        task_title = graphene.String(required=True)
        due_date = graphene.Date()
        order = graphene.Int()

    task = graphene.Field(ConsultancyPlanTaskType)
    success = graphene.Boolean()

    def mutate(self, info, consultancy_id, task_title, due_date=None, order=0):
        try:
            req = ConsultancyRequest.objects.get(id=consultancy_id)
        except ConsultancyRequest.DoesNotExist:
            return CreateConsultancyPlanTask(task=None, success=False)

        plan, _ = ConsultancyPlan.objects.get_or_create(consultancy_request=req, defaults={'title': 'Project Plan'})
        task = ConsultancyPlanTask.objects.create(
            plan=plan,
            task_title=task_title,
            due_date=due_date,
            order=order or 0,
        )
        return CreateConsultancyPlanTask(task=task, success=True)


class UpdateConsultancyPlanTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        task_title = graphene.String()
        due_date = graphene.Date()
        is_completed = graphene.Boolean()
        order = graphene.Int()

    task = graphene.Field(ConsultancyPlanTaskType)
    success = graphene.Boolean()

    def mutate(self, info, id, task_title=None, due_date=None, is_completed=None, order=None):
        try:
            task = ConsultancyPlanTask.objects.get(id=id)
        except ConsultancyPlanTask.DoesNotExist:
            return UpdateConsultancyPlanTask(task=None, success=False)

        if task_title is not None:
            task.task_title = task_title
        if due_date is not None:
            task.due_date = due_date
        if is_completed is not None:
            task.is_completed = is_completed
        if order is not None:
            task.order = order
        task.save()
        return UpdateConsultancyPlanTask(task=task, success=True)


class DeleteConsultancyPlanTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            ConsultancyPlanTask.objects.get(id=id).delete()
            return DeleteConsultancyPlanTask(success=True)
        except ConsultancyPlanTask.DoesNotExist:
            return DeleteConsultancyPlanTask(success=False)


class CreateService(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        icon_key = graphene.String()
        service_areas = graphene.List(graphene.String)
        order = graphene.Int()
        is_active = graphene.Boolean()

    service = graphene.Field(ServiceType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, title, description=None, icon_key=None, service_areas=None, order=None, is_active=True):
        service = Service.objects.create(
            title=title,
            description=description or '',
            icon_key=icon_key or 'briefcase',
            service_areas=service_areas or [],
            order=order or 0,
            is_active=True if is_active is None else is_active,
        )
        return CreateService(service=service, success=True, message='Service created successfully.')


class UpdateService(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        icon_key = graphene.String()
        service_areas = graphene.List(graphene.String)
        order = graphene.Int()
        is_active = graphene.Boolean()

    service = graphene.Field(ServiceType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, title=None, description=None, icon_key=None, service_areas=None, order=None, is_active=None):
        try:
            service = Service.objects.get(id=id)
            if title is not None:
                service.title = title
            if description is not None:
                service.description = description
            if icon_key is not None:
                service.icon_key = icon_key
            if service_areas is not None:
                service.service_areas = service_areas
            if order is not None:
                service.order = order
            if is_active is not None:
                service.is_active = is_active

            service.save()
            return UpdateService(service=service, success=True, message='Service updated successfully.')
        except Service.DoesNotExist:
            return UpdateService(service=None, success=False, message='Service not found.')


class DeleteService(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        try:
            service = Service.objects.get(id=id)
            service.delete()
            return DeleteService(success=True, message='Service deleted successfully.')
        except Service.DoesNotExist:
            return DeleteService(success=False, message='Service not found.')


class CreateHeroContent(graphene.Mutation):
    class Arguments:
        tagline = graphene.String(required=True)
        heading = graphene.String(required=True)
        description = graphene.String(required=True)
        cta_text = graphene.String()
        background_image_url = graphene.String()
        overlay_color = graphene.String()
        overlay_opacity = graphene.Float()
        order = graphene.Int()
        is_active = graphene.Boolean()

    hero_content = graphene.Field(HeroContentType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, tagline, heading, description, cta_text=None, background_image_url=None, overlay_color=None, overlay_opacity=None, order=None, is_active=True):
        hero_content = HeroContent.objects.create(
            tagline=tagline,
            heading=heading,
            description=description,
            cta_text=cta_text or 'Get Started',
            background_image_url=background_image_url or '',
            overlay_color=overlay_color or '#000000',
            overlay_opacity=0.6 if overlay_opacity is None else max(0.0, min(1.0, overlay_opacity)),
            order=order or 0,
            is_active=True if is_active is None else is_active,
        )
        return CreateHeroContent(hero_content=hero_content, success=True, message='Hero content created successfully.')


class UpdateHeroContent(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        tagline = graphene.String()
        heading = graphene.String()
        description = graphene.String()
        cta_text = graphene.String()
        background_image_url = graphene.String()
        overlay_color = graphene.String()
        overlay_opacity = graphene.Float()
        order = graphene.Int()
        is_active = graphene.Boolean()

    hero_content = graphene.Field(HeroContentType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, tagline=None, heading=None, description=None, cta_text=None, background_image_url=None, overlay_color=None, overlay_opacity=None, order=None, is_active=None):
        try:
            hero_content = HeroContent.objects.get(id=id)
            if tagline is not None:
                hero_content.tagline = tagline
            if heading is not None:
                hero_content.heading = heading
            if description is not None:
                hero_content.description = description
            if cta_text is not None:
                hero_content.cta_text = cta_text
            if background_image_url is not None:
                hero_content.background_image_url = background_image_url
            if overlay_color is not None:
                hero_content.overlay_color = overlay_color
            if overlay_opacity is not None:
                hero_content.overlay_opacity = max(0.0, min(1.0, overlay_opacity))
            if order is not None:
                hero_content.order = order
            if is_active is not None:
                hero_content.is_active = is_active

            hero_content.save()
            return UpdateHeroContent(hero_content=hero_content, success=True, message='Hero content updated successfully.')
        except HeroContent.DoesNotExist:
            return UpdateHeroContent(hero_content=None, success=False, message='Hero content not found.')


class DeleteHeroContent(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        try:
            hero_content = HeroContent.objects.get(id=id)
            hero_content.delete()
            return DeleteHeroContent(success=True, message='Hero content deleted successfully.')
        except HeroContent.DoesNotExist:
            return DeleteHeroContent(success=False, message='Hero content not found.')


class CreateCompanyUpdate(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        content = graphene.String()
        image_url = graphene.String()
        is_published = graphene.Boolean()

    company_update = graphene.Field(CompanyUpdateType)
    success = graphene.Boolean()

    def mutate(self, info, title, content=None, image_url=None, is_published=False):
        obj = CompanyUpdate.objects.create(
            title=title, content=content or '', image_url=image_url or '',
            is_published=False if is_published is None else is_published,
        )
        return CreateCompanyUpdate(company_update=obj, success=True)


class UpdateCompanyUpdate(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        content = graphene.String()
        image_url = graphene.String()
        is_published = graphene.Boolean()

    company_update = graphene.Field(CompanyUpdateType)
    success = graphene.Boolean()

    def mutate(self, info, id, title=None, content=None, image_url=None, is_published=None):
        try:
            obj = CompanyUpdate.objects.get(id=id)
            if title is not None:
                obj.title = title
            if content is not None:
                obj.content = content
            if image_url is not None:
                obj.image_url = image_url
            if is_published is not None:
                obj.is_published = is_published
            obj.save()
            return UpdateCompanyUpdate(company_update=obj, success=True)
        except CompanyUpdate.DoesNotExist:
            return UpdateCompanyUpdate(company_update=None, success=False)


class DeleteCompanyUpdate(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            CompanyUpdate.objects.get(id=id).delete()
            return DeleteCompanyUpdate(success=True)
        except CompanyUpdate.DoesNotExist:
            return DeleteCompanyUpdate(success=False)


class CreateClient(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        logo = graphene.String()
        industry = graphene.String()
        is_featured = graphene.Boolean()

    client = graphene.Field(ClientType)
    success = graphene.Boolean()

    def mutate(self, info, name, logo=None, industry=None, is_featured=False):
        obj = Client.objects.create(
            name=name, logo=logo or '', industry=industry or '',
            is_featured=False if is_featured is None else is_featured,
        )
        return CreateClient(client=obj, success=True)


class UpdateClient(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        logo = graphene.String()
        industry = graphene.String()
        is_featured = graphene.Boolean()

    client = graphene.Field(ClientType)
    success = graphene.Boolean()

    def mutate(self, info, id, name=None, logo=None, industry=None, is_featured=None):
        try:
            obj = Client.objects.get(id=id)
            if name is not None:
                obj.name = name
            if logo is not None:
                obj.logo = logo
            if industry is not None:
                obj.industry = industry
            if is_featured is not None:
                obj.is_featured = is_featured
            obj.save()
            return UpdateClient(client=obj, success=True)
        except Client.DoesNotExist:
            return UpdateClient(client=None, success=False)


class DeleteClient(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            Client.objects.get(id=id).delete()
            return DeleteClient(success=True)
        except Client.DoesNotExist:
            return DeleteClient(success=False)


class UpdateCompanyStats(graphene.Mutation):
    class Arguments:
        client_satisfaction = graphene.String()
        years_experience = graphene.String()

    company_stats = graphene.Field(CompanyStatsType)
    success = graphene.Boolean()

    def mutate(self, info, client_satisfaction=None, years_experience=None):
        stats, _ = CompanyStats.objects.get_or_create(
            id=1,
            defaults={'client_satisfaction': '98%', 'years_experience': '15+'},
        )
        if client_satisfaction is not None:
            stats.client_satisfaction = client_satisfaction
        if years_experience is not None:
            stats.years_experience = years_experience
        stats.save()
        return UpdateCompanyStats(company_stats=stats, success=True)


class Mutation(graphene.ObjectType):
    create_contact_request = CreateContactRequest.Field()
    register = RegisterUser.Field()
    login = LoginUser.Field()
    logout = LogoutUser.Field()
    create_property = CreateProperty.Field()
    update_property = UpdateProperty.Field()
    delete_property = DeleteProperty.Field()
    create_hero_image = CreateHeroImage.Field()
    update_hero_image = UpdateHeroImage.Field()
    delete_hero_image = DeleteHeroImage.Field()
    create_service = CreateService.Field()
    update_service = UpdateService.Field()
    delete_service = DeleteService.Field()
    create_hero_content = CreateHeroContent.Field()
    update_hero_content = UpdateHeroContent.Field()
    delete_hero_content = DeleteHeroContent.Field()
    create_consultancy_request = CreateConsultancyRequest.Field()
    update_consultancy_request_status = UpdateConsultancyRequestStatus.Field()
    ensure_consultancy_plan = EnsureConsultancyPlan.Field()
    create_consultancy_plan_task = CreateConsultancyPlanTask.Field()
    update_consultancy_plan_task = UpdateConsultancyPlanTask.Field()
    delete_consultancy_plan_task = DeleteConsultancyPlanTask.Field()
    create_company_update = CreateCompanyUpdate.Field()
    update_company_update = UpdateCompanyUpdate.Field()
    delete_company_update = DeleteCompanyUpdate.Field()
    create_client = CreateClient.Field()
    update_client = UpdateClient.Field()
    delete_client = DeleteClient.Field()
    update_company_stats = UpdateCompanyStats.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
