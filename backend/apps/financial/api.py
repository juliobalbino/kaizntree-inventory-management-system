from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_financial_summary, get_financial_timeline, get_per_product_financials
from .serializers import FinancialSummarySerializer, FinancialTimelineSerializer, ProductFinancialSerializer


class FinancialSummaryView(APIView):
    def get(self, request):
        date_from = request.GET.get("date_from") or None
        date_to = request.GET.get("date_to") or None
        product_ids = request.GET.getlist("product_ids") or request.GET.getlist("product_ids[]") or None

        data = get_financial_summary(
            request.user.organization,
            date_from=date_from,
            date_to=date_to,
            product_ids=product_ids,
        )
        return Response(FinancialSummarySerializer(data).data)


class ProductFinancialView(APIView):
    def get(self, request):
        date_from = request.GET.get("date_from") or None
        date_to = request.GET.get("date_to") or None
        product_ids = request.GET.getlist("product_ids") or request.GET.getlist("product_ids[]") or None

        data = get_per_product_financials(
            request.user.organization,
            date_from=date_from,
            date_to=date_to,
            product_ids=product_ids,
        )
        return Response(ProductFinancialSerializer(data, many=True).data)


class FinancialTimelineView(APIView):
    def get(self, request):
        date_from = request.GET.get("date_from") or None
        date_to = request.GET.get("date_to") or None
        product_ids = request.GET.getlist("product_ids") or request.GET.getlist("product_ids[]") or None
        group_by = request.GET.get("group_by", "month")
        if group_by not in ("day", "month", "year"):
            group_by = "month"

        data = get_financial_timeline(
            request.user.organization,
            group_by=group_by,
            date_from=date_from,
            date_to=date_to,
            product_ids=product_ids,
        )
        return Response(FinancialTimelineSerializer(data, many=True).data)
