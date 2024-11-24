from django.urls import path, include
from .views import *
from rest_framework import routers
from rest_framework.permissions import IsAuthenticated
from . import views

class BaseRouterRootView(routers.APIRootView):
    # permission_classes = [IsAuthenticated]
    def get_view_name(self) -> str:
        return "MCDA API"

class BaseRouter(routers.DefaultRouter):
    APIRootView = BaseRouterRootView

router = BaseRouter()
# router.register(r'scrape', views.ScrapeFortuneDataView, basename='scrape')
router.register(r'scraped-data', views.CachedFortuneDataView, basename='scraped-data')
router.register(r'ahp', views.AHPView, basename='ahp-view')
router.register(r'promethee', views.PrometheeView, basename='promethee-view')
router.register(r'criteria-db', views.CriteriaWeightsView, basename='criteria-db')
# router.register(r'criteria', views.CriteriaWeightsView, basename='criteria')
# router.register(r'topsis', views.TOPSISView, basename='topsis-view')


urlpatterns = [
    path('', include(router.urls)),
    path('scrape/', ScrapeFortuneDataView.as_view(), name='trigger-scraping'),
    path('topsis/', TOPSISView.as_view(), name='topsis-method'),
    # path('', ApiRootView.as_view(), name='api-root'),  
    # path('scraped-data/', CachedFortuneDataView.as_view(), name='cached-data'),
    # path('ahp/', AHPView.as_view(), name='ahp-method'),
    # path('promethee/', PrometheeView.as_view(), name='promethee-method'),
]
