from django.shortcuts import render
from rest_framework import viewsets,status
from rest_framework.response import Response
from .models import Order, OrderItem, Address
from .serializers import OrderSerializer, OrderItemSerializer, AddressSerializer,OrderAdminSerializer
from rest_framework import generics
from .models import Address
from .serializers import AddressSerializer
from django.db import transaction
from rest_framework import serializers
import razorpay
from rest_framework.views import APIView
from django.conf import settings
from rest_framework.permissions import IsAdminUser
from product.permission import IsActiveUser
from Users.models import CustomUser
from product.models import Product
from django.db.models import Sum,Count

class CreateOrderViwe(APIView):
    permission_classes = [IsActiveUser]
    def post(self,request):
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        amount_in_rupees = request.data.get('amount')
        amount_in_paisa = int(amount_in_rupees) * 100

        data = {
            'amount': amount_in_paisa,
            'currency': 'INR',
            'payment_capture': '1' 
        }
        
        try:
           
            order = client.order.create(data=data)
            
            return Response({
                'order_id': order['id'],     
                'amount': order['amount'],
                'currency': order['currency'],
                'key': settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsActiveUser]
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
    permission_classes = [IsActiveUser]
    pagination_class = None
    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsActiveUser]
    pagination_class = None
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsActiveUser]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AdminOrderListView(generics.ListAPIView):
    serializer_class =OrderAdminSerializer

    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related('items').all().order_by('-created_at')
    
class AdminOrderUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = OrderAdminSerializer
    queryset =Order.objects.select_related('user'
    ).prefetch_related('items').all()

    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser] 

    def get(self, request):
        total_income = Order.objects.aggregate(sum=Sum('total_amount'))['sum'] or 0
        total_products = Product.objects.count()
        total_users = CustomUser.objects.count()
        total_orders = Order.objects.count()
        total_payment_success=Order.objects.filter(payment_status='Success').aggregate(sum=Sum('total_amount'))['sum'] or 0
        total_payment_pending=Order.objects.filter(payment_status='Pending').aggregate(sum=Sum('total_amount'))['sum'] or 0
        status_counts = Order.objects.values('status').annotate(count=Count('id'))

        data = {
            "total_income": total_income,
            "total_products": total_products,
            "total_users": total_users,
            "total_orders": total_orders,
            "order_status_breakdown": status_counts,
            "total_payment_success":total_payment_success,
            "total_payment_pending":total_payment_pending,
        }
        return Response(data)

