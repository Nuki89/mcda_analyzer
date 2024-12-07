from django.urls import path, include
from rest_framework import routers
from rest_framework.permissions import IsAuthenticated
from .views import *
from . import views

class BaseRouterRootView(routers.APIRootView):
    # permission_classes = [IsAuthenticated]
    def get_view_name(self) -> str:
        return "MCDA API"

class BaseRouter(routers.DefaultRouter):
    APIRootView = BaseRouterRootView

router = BaseRouter()
router.register(r'scraped-data', views.CachedFortuneDataView, basename='scraped-data')
router.register(r'ahp-results', AHPResultViewSet, basename='ahp-results')
router.register(r'promethee-results', PrometheeResultViewSet, basename='promethee-results')
router.register(r'criteria', views.CriteriaWeightsView, basename='criteria')
router.register(r'default-criteria', views.CriteriaDBView, basename='criteria-db')


urlpatterns = [
    path('', include(router.urls)),
    path('scrape/', ScrapeFortuneDataView.as_view(), name='trigger-scraping'),
    path('topsis/', TOPSISView.as_view(), name='topsis-method'),
    path('ahp/', AHPView.as_view(), name='ahp-view'),
    path('promethee/', PrometheeView.as_view(), name='promethee-method'),
]
