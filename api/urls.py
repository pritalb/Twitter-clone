from django.urls import path

from . import views

urlpatterns = [
    path('posts/new/', views.create_new_post, name='new_post'),
    path('posts/all/page=<int:page>/', views.get_all_posts, name='get_all_posts'),
    path('posts/following/page=<int:page>/', views.get_following_posts, name='get_following_posts'),
    path('posts/<int:post_id>/like/', views.like_post, name='like_post'),
    path('posts/<int:post_id>/unlike/', views.unlike_post, name='unlike_post'),
    path('posts/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('posts/<int:post_id>/likedby/requestuser/', views.post_likedby, name='post_likedby'),
    path('posts/<int:post_id>/isowner/', views.is_post_owner, name='is_post_owner'),
    path('users/<int:user_id>/', views.get_user_profile, name='get_user'),
    path('users/<int:user_id>/page=<int:page>/', views.get_user_profile_posts, name='get_user_posts'),
    path('users/<int:user_id>/follow/', views.follow_user, name='follow_user'),
    path('users/<int:user_id>/unfollow/', views.unfollow_user, name='unfollow_user'),
    path('user/status/', views.get_user_status, name='get_user_status'),
]