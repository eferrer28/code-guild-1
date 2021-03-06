from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$', views.blog_index, name='index'),
    url(r'(?P<pk>\d+)/(?P<slug>[\w-]+)/$', views.blog_post_detail, name='detail'),
    url(r'vote/$', views.vote, name='vote'),
    url(r'add_comment/$', views.add_comment, name='add_comment'),
    url(r'get_comments/$', views.get_comments, name='get_comments'),
)
