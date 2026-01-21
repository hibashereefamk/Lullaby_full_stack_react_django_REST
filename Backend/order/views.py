from django.shortcuts import render
from rest_framework import viewsets, permissions,status
from rest_framework.response import Response
from .models import Order, OrderItem, Address, Payment
from .serializers import OrderSerializer, OrderItemSerializer, AddressSerializer, PaymentSerializer 
from rest_framework import generics, permissions
from .models import Address
from .serializers import AddressSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names =['get','post','head','options']

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)
    



class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return addresses for the currently logged-in user
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the new address to the logged-in user
        serializer.save(user=self.request.user)

        
class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        if order.user != self.request.user:
            raise permissions.PermissionDenied("You cannot create a payment for someone else's order.")
        serializer.save()


