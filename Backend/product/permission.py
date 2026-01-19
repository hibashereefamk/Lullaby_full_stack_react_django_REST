from rest_framework import permissions

class IsVendorOrAdminOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        
        if request.method in permissions.SAFE_METHODS:
            return True

        
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['vendor', 'admin']

    
class IsCustomer(permissions.BasePermission):
    def has_permission(self,request,view):
        return request.user and request.user.role == 'customer'
    
class IsAdminOrStoreOwner(permissions.BasePermission):
    def has_permission(self,request,view):
        return request.user and (request.user.role == 'admin' or request.user.role == 'vendor')