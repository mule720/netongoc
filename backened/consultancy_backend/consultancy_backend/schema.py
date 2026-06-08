import graphene
from backend.schema import Query as BackendQuery, Mutation as BackendMutation


class Query(BackendQuery):
    pass


class Mutation(BackendMutation):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
