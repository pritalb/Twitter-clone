// API Endpoints / URLs
const Root_URL = 'http://127.0.0.1:8000/'
const followingPostsURL = Root_URL + 'api/posts/following/page=1/'
const userStatusURL = Root_URL + 'api/user/status/'

// Helper functions

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Helper Functions end

const HeartIconLiked = () => {
    return (
        <div className='heart'>
            <img width="256" alt="A perfect SVG heart" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/A_perfect_SVG_heart.svg/256px-A_perfect_SVG_heart.svg.png" />
        </div>
    )
}

const HeartIconUnliked = () => {
    return (
        <div className='heart'>
            <img width="512" alt="Ei-heart" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ei-heart.svg/512px-Ei-heart.svg.png" />
        </div>
    )
}

const Post = ({post, setRerenderPosts, userStatus}) => {
    const likeURL = Root_URL + `api/posts/${post.id}/like/`
    const unlikeURL = Root_URL + `api/posts/${post.id}/unlike/`
    const isPostLikedURL = Root_URL + `api/posts/${post.id}/likedby/requestuser/`
    const userProfileURL = Root_URL + `user/${post.user_id}/`

    const [isPostLiked, setIsPostLiked] = React.useState(false)

    React.useEffect(async () => {
        const response = await fetch(isPostLikedURL)
        const data = await response.json()
        setIsPostLiked(data.is_post_liked_by_user)
    }, [])

    const likePost = async () => {
        const response = await fetch(likeURL, {
            method : 'PUT',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        })
        setRerenderPosts('A post has been liked')
        setIsPostLiked(true)
    }

    const unlikePost = async () => {
        const response = await fetch(unlikeURL, {
            method : 'PUT',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        })
        setRerenderPosts('A post has been unliked')
        setIsPostLiked(false)
    }


    return (
        <div className='post'>
            <div className='post_label'>
                <div className='post_username'> <a href={userProfileURL}> {post.post_user} </a> </div>
                <div className='post_pubdate'>{post.date_published}</div>
            </div>

            <div className='post_body'>
                <div className='post_content'>
                    {post.content}
                </div>
            </div>

            <div className='post_footer'>
                <div className='post_likes'>
                    {
                        isPostLiked
                        ?
                            <HeartIconLiked />
                        :
                            <HeartIconUnliked />
                    }

                    <div className='post_likes_count'>
                        {post.likes}
                    </div>
                </div>

                {
                    userStatus.authenticated &&
                        <div className='post_buttons'>
                            
                                {
                                    isPostLiked ?
                                    <button className='btn' onClick={unlikePost}> UnLike </button>
                                    :
                                    <button className='btn' onClick={likePost}> Like </button>
                                }
                        </div>
                }
            </div>
        </div>
    )
}


const FollowingPosts = ({reRenderPosts, setRerenderPosts, userStatus}) => {
    const [postsObject, setPostsObject] = React.useState({})
    const [posts, setPosts] = React.useState({})

    const getPaginatedPosts = async (url) => {
        const response = await fetch(url)
        const data = await response.json()

        const postsArray = Object.values(data.posts)

        setPostsObject(data)
        setPosts(postsArray.reverse())
    }

    React.useEffect(() => {
        getPaginatedPosts(followingPostsURL)
        }, [reRenderPosts])
   
    return (
            <div class='post_container'>
                {
                    Object.keys(posts).map((post) => (
                        <Post post={posts[post]} setRerenderPosts={setRerenderPosts} userStatus={userStatus} />
                    ))

                    
                }

                {
                    (postsObject.has_previous) && <button className='btn' onClick={() => {
                        getPaginatedPosts(postsObject.previous_page)
                    }}> Previous </button>
                }

                {
                    (postsObject.has_next) && <button className='btn' onClick={() => {
                        getPaginatedPosts(postsObject.next_page)
                    }}> Next </button> 
                }
            </div>
    )
}


const App = () => {
    const [reRenderPosts, setRerenderPosts] = React.useState('')
    const [userStatus, setUserStatus] = React.useState({})

    React.useEffect(async () => {
        const response = await fetch(userStatusURL)
        const data = await response.json()
        setUserStatus(data)
    }, [])

    return (
        <div id='main-page'>
            <FollowingPosts reRenderPosts={reRenderPosts} setRerenderPosts={setRerenderPosts} userStatus={userStatus} />
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('app'))