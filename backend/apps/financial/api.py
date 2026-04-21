from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_financial_summary, get_per_product_financials
from .serializers import FinancialSummarySerializer, ProductFinancialSerializer


class FinancialSummaryView(APIView):
    def get(self, request):
        data = get_financial_summary(request.user.organization)
        return Response(FinancialSummarySerializer(data).data)


class ProductFinancialView(APIView):
    def get(self, request):
        data = get_per_product_financials(request.user.organization)
        return Response(ProductFinancialSerializer(data, many=True).data)
