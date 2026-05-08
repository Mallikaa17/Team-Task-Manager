from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Project, Task
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'

class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role='member', created_by=self.request.user)

    def perform_create(self, serializer):
        # Admins can explicitly create users as members
        serializer.save(role='member', created_by=self.request.user)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Project.objects.filter(owner=self.request.user).distinct()
        else:
            # Members can see projects where they are assigned to
            return Project.objects.filter(assigned_members=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def assign_members(self, request, pk=None):
        project = self.get_object()
        member_ids = request.data.get('member_ids', [])

        # Ensure all IDs belong to users with the 'member' role and created by this admin
        members = User.objects.filter(id__in=member_ids, role='member', created_by=request.user)

        # Replace the assigned members with the new list
        project.assigned_members.set(members)
        
        return Response({'status': 'members assigned', 'assigned_members': members.values_list('id', flat=True)})

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Task.objects.filter(project__owner=self.request.user)
        else:
            # Members should see tasks for projects they are assigned to
            return Task.objects.filter(project__assigned_members=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if request.user.role == 'member' and task.project.owner != request.user:
            if 'status' in request.data:
                task.status = request.data['status']
                task.save()
                return Response(self.get_serializer(task).data)
            return Response({"error": "Members can only update status"}, status=403)
        return super().update(request, *args, **kwargs)
