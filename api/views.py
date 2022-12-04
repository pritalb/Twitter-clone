from ast import And
from operator import truediv
from turtle import pos
from urllib import response
from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import  csrf_exempt
from django.core.paginator import Paginator, EmptyPage
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.decorators import api_view

from network.models import Post, User
from  .utils import  emptyString
# Create your views here.

@api_view(['POST',])
@login_required
def create_new_post(request):
    data = request.data
    post_content = data['content']
    
    if (emptyString(post_content)):
        return Response({
            'message' : 'Error! Submitted empty post',
        })

    post = Post.objects.create(content=post_content, poster=request.user)
    post.save()
    
    return Response({'message': 'post created successfully.'})

@api_view(['GET'])
def get_all_posts(request, page):
    posts = Post.objects.all()
    posts_json = {}
    page_size = 10
    p = Paginator(posts, page_size)

    try:
        page_obj = p.page(page)
    except EmptyPage:
        page_obj = p.page(1)

    has_next = page_obj.has_next()
    has_previous = page_obj.has_previous()
    next_page = ''
    previous_page = ''

    if has_next:
        next_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.next_page_number()}))

    if has_previous:
        previous_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.previous_page_number()}))
  

    for post in page_obj:
        posts_json[post.pk] = {
            'content' : post.content,
            'likes' : post.likes,
            'post_user' : str(post.poster).capitalize(),
            'date_published' : post.date_published.strftime("%a, %b %d, %Y, %I:%M:%S %p"),
            'id' : post.pk,
            'user_id' : post.poster.pk,
        }

    return Response({
        'current_page': page_obj.number,
        'has_next': has_next,
        'next_page': next_page,
        'has_previous': has_previous,
        'previous_page': previous_page,
        'number_of_pages': p.num_pages,
        'posts': posts_json,  
    })

@api_view(['GET'])
@login_required
def get_following_posts(request, page):
    user = request.user
    following = user.following.all()
    following_posts = {}

    posts = []

    for profile in following:
        for post in profile.posts.all():
            posts.append( (post.pk, {
                'content' : post.content,
                'likes' : post.likes,
                'post_user' : str(post.poster).capitalize(),
                'date_published' : post.date_published.strftime("%a, %b %d, %Y, %I:%M:%S %p"),
                'id' : post.pk,
                'user_id' : post.poster.pk,
            }) )


    page_size = 10
    p = Paginator(posts, page_size)

    try:
        page_obj = p.page(page)
    except EmptyPage:
        page_obj = p.page(1)

    has_next = page_obj.has_next()
    has_previous = page_obj.has_previous()
    next_page = ''
    previous_page = ''

    if has_next:
        next_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.next_page_number()}))

    if has_previous:
        previous_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.previous_page_number()}))

    for post in page_obj:
        following_posts[post[0]] = post[1]

    return Response({
    'current_page': page_obj.number,
    'has_next': has_next,
    'next_page': next_page,
    'has_previous': has_previous,
    'previous_page': previous_page,
    'number_of_pages': p.num_pages,
    'posts': following_posts,  
})


@api_view(['PUT'])
@login_required
def edit_post(request, post_id):
    post = Post.objects.get(pk=post_id)

    if request.user != post.poster:
        return Response({'detail': 'access denied.'})

    data = request.data
    post.content = data['content']
    post.save()

    return Response({'detail': 'post edited successfully.'})

@api_view(['GET'])
def get_user_profile(request, user_id):
    queried_user = User.objects.get(pk=user_id)
    follow_allowed = (request.user != queried_user) and (request.user.is_authenticated)
    user_posts_json = {}
    user_followed = queried_user in request.user.following.all()

    try:
        following = queried_user.following.all()
    except:
        following = {}

    try:
        followers = queried_user.followers.all()
    except:
        followers = {}

    return Response({
        'name' : str(queried_user).capitalize(),
        'can_follow' : follow_allowed,
        'followed' : user_followed,
        'total_followers' : len(followers),
        'total_following' : len(following),
    })

@api_view(['GET'])
def get_user_profile_posts(request, user_id, page):
    queried_user = User.objects.get(pk=user_id)
    user_posts_json = {}

    try:
        user_posts = queried_user.posts.all()
    except:
        user_posts = []

    page_size = 10
    p = Paginator(user_posts, page_size)
    
    try:
        page_obj = p.page(page)
    except EmptyPage:
        page_obj = p.page(1)

    has_next = page_obj.has_next()
    has_previous = page_obj.has_previous()
    next_page = ''
    previous_page = ''

    if has_next:
        next_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.next_page_number()}))

    if has_previous:
        previous_page = request.build_absolute_uri(reverse('get_all_posts', kwargs={'page': page_obj.previous_page_number()}))

    for post in page_obj:
        user_posts_json[post.pk] = {
            'content' : post.content,
            'likes' : post.likes,
            'post_user' : str(post.poster).capitalize(),
            'date_published' : post.date_published.strftime("%a, %b %d, %Y, %I:%M:%S %p"),
            'id' : post.pk,
            'user_id' : post.poster.pk,
        }

    return Response({
            'current_page': page_obj.number,
            'has_next': has_next,
            'next_page': next_page,
            'has_previous': has_previous,
            'previous_page': previous_page,
            'number_of_pages': p.num_pages,
            'posts': user_posts_json,  
    })


@api_view(['GET'])
def get_user_status(request):
    user = request.user

    return Response({
        'user' : str(user),
        'authenticated' : user.is_authenticated,
    })

@api_view(['PUT'])
@login_required
def follow_user(request, user_id):
    current_user = request.user
    user_to_follow = User.objects.get(pk=user_id)

    current_user.following.add(user_to_follow)
    current_user.save()

    return Response({'message': 'user followed successfully.'})

@api_view(['PUT'])
@login_required
def unfollow_user(request, user_id):
    current_user = request.user
    user_to_unfollow = User.objects.get(pk=user_id)

    current_user.following.remove(user_to_unfollow)
    current_user.save()

    return Response({'message': 'user unfollowed successfully.'})

@api_view(['PUT'])
@login_required
def like_post(request, post_id):
    post = Post.objects.get(pk=post_id)
    post.likes += 1
    post.likers.add(request.user)
    post.save()

    return Response({'message': 'post liked successfully.'})

@api_view(['PUT'])
@login_required
def unlike_post(request, post_id):
    user = request.user
    post = Post.objects.get(pk=post_id)
    likers = post.likers.all()

    if user in likers:
        post.likes -= 1
        post.likers.remove(user)
        post.save()
        return Response({'message': 'post unliked successfully.'})
    return Response({'message': 'can\'t unlike post not previously liked by user.'})

@api_view(['GET'])
def post_likedby(request, post_id):
    post = Post.objects.get(pk=post_id)
    user = request.user

    return Response({
        'user' : str(user),
        'is_post_liked_by_user' : user in post.likers.all(),
    })

@api_view(['GET'])
def is_post_owner(request, post_id):
    post = Post.objects.get(pk=post_id)
    user = request.user

    return Response({
        'user' : str(user),
        'is_post_owner' : user == post.poster,
    })
