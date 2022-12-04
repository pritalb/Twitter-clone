// API Endpoints / URLs
const Root_URL = 'http://127.0.0.1:8000/'
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
            <div className='post_content'>
                <div>{post.likes}</div>
                <span> <a href={userProfileURL}> {post.post_user} </a> </span>
                <div>{post.content}</div>
                <span>{post.date_published}</span>
            </div>

            {
                userStatus.authenticated &&
                    <div className='post_buttons'>
                        
                            {
                                isPostLiked ?
                                    <button onClick={unlikePost}> UnLike </button>
                                :
                                    <button onClick={likePost}> Like </button>
                            }
                    </div>
            }
        </div>
    )
}

const UserPosts = ({user_id, reRenderPosts, setRerenderPosts, userStatus}) => {
    const userPostsURL = Root_URL + `api/users/${user_id}/page=1`

    const [postsObject, setPostsObject] = React.useState({})
    const [posts, setPosts] = React.useState([])

    const getPaginatedPosts = async (url) => {
        const response = await fetch(url).then((response) => response.json())
        .then((data) => {
            const postsArray = Object.values(data.posts)

            setPostsObject(data)
            setPosts(postsArray.reverse())
            setRerenderPosts('user posts fetched.')
        })
    }

    React.useEffect(() => {
        getPaginatedPosts(userPostsURL)
    }, [reRenderPosts])
   
    return (
            <div class='post_container'>
                {
                    posts.map((post) => (
                        <Post post={post} setRerenderPosts={setRerenderPosts} userStatus={userStatus} />
                    ))

                }

                {
                    (postsObject.has_previous) && <button onClick={() => {
                        getPaginatedPosts(postsObject.previous_page)
                    }}> Previous </button>
                }

                {
                    (postsObject.has_next) && <button onClick={() => {
                        getPaginatedPosts(postsObject.next_page)
                    }}> Next </button> 
                }
            </div>
    )
}

const Profile = ({user_id, reRenderPosts, setRerenderPosts, userStatus}) => {
    const userProfileURL = Root_URL + `api/users/${user_id}/`
    const userFollowURL = Root_URL + `api/users/${user_id}/follow/`
    const userUnfollowURL = Root_URL + `api/users/${user_id}/unfollow/`

    const [profileData, setProfileData] = React.useState({})
    const [followed, setFollowed] = React.useState(false)

    React.useEffect(async () => {
        const response = await fetch(userProfileURL)
        const data = await response.json()

        setFollowed(data.followed)
        await setProfileData(data)
    }, [reRenderPosts])

    const followUser = async () => {
        // console.log('now following user.')
        const response = await fetch(userFollowURL, {
            'method' : 'PUT',
            'headers' : {
                'X-CSRFToken' : csrftoken,
            }
        })
        setFollowed(true)
        setRerenderPosts('User has been followed.')
    }

    const unfollowUser = async () => {
        const response = await fetch(userUnfollowURL, {
            'method' : 'PUT',
            'headers' : {
                'X-CSRFToken' : csrftoken,
            }
        })
        setFollowed(false)
        setRerenderPosts('User has been unfollowed.')
    }

    return (
        <div id='user_profile'> 
            <h3> {profileData.name} </h3>
            <div> Following : {profileData.total_following} </div>
            <div> Followers : {profileData.total_followers} </div>

            <div>
                {
                    (profileData.can_follow && userStatus.authenticated ) && (followed
                    ?
                        <button onClick={unfollowUser}> Unfollow </button>
                    :
                        <button onClick={followUser}> Follow </button>
                    )
                }
            </div>

            <UserPosts user_id={user_id} reRenderPosts={reRenderPosts} setRerenderPosts={setRerenderPosts} userStatus={userStatus} />
        </div>
    )
}

const App = ({user_id}) => {
    const [reRenderPosts, setRerenderPosts] = React.useState('')
    const [userStatus, setUserStatus] = React.useState({})

    React.useEffect(async () => {
        const response = await fetch(userStatusURL)
        const data = await response.json()
        setUserStatus(data)
    }, [])

    return (
        <Profile user_id={user_id} reRenderPosts={reRenderPosts} setRerenderPosts={setRerenderPosts} userStatus={userStatus}/>
    )
}

ReactDOM.render(<App user_id={user_id} />, document.getElementById('app'))