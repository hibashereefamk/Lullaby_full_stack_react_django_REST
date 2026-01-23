from django.shortcuts import render
from rest_framework import viewsets, permissions,status
from rest_framework.response import Response
from .models import Order, OrderItem, Address, Payment
from .serializers import OrderSerializer, OrderItemSerializer, AddressSerializer, PaymentSerializer 
from rest_framework import generics, permissions
from .models import Address
from .serializers import AddressSerializer
from django.db import transaction
from rest_framework import serializers
import razorpay
from rest_framework.views import APIView
from django.conf import settings

class CreateOrderViwe(APIView):
    def post(self,request):
       # Fix: Add .Client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        amount_in_rupees = request.data.get('amount')
        amount_in_paisa = int(amount_in_rupees) * 100

        data = {
            'amount': amount_in_paisa,
            'currency': 'INR',
            'payment_capture': '1' 
        }
        
        try:
            # 3. Ask Razorpay to create an order
            order = client.order.create(data=data)
            
            # 4. Send the Order ID and Key ID back to React
            return Response({
                'order_id': order['id'],      # e.g., "order_Hjkh8908..."
                'amount': order['amount'],
                'currency': order['currency'],
                'key': settings.RAZORPAY_KEY_ID # Send the Public Key ID to React
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names =['get','post','head','options']
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data =request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)

                headers =self.get_success_headers(serializer.data)
                return Response(serializer.data,status=status.HTTP_201_CREATED,headers=headers)
        except serializers.ValidationError as e:
            return Response({'error':e.detail},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error':str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

                
class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)
    



class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    def get_queryset(self):
        
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
       
        serializer.save(user=self.request.user)
class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # This handles the lookup logic automatically
        return Address.objects.filter(user=self.request.user)

        
class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        if order.user != self.request.user:
            raise permissions.PermissionDenied("You cannot create a payment for someone else's order.")
        serializer.save()




