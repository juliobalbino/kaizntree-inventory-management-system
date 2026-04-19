from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientStockError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Insufficient stock."
    default_code = "insufficient_stock"


class BusinessRuleViolation(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Business rule violation."
    default_code = "business_rule_violation"
