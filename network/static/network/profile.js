// API Endpoints / URLs
const Root_URL = 'http://127.0.0.1:8000/'
const userStatusURL = Root_URL + 'api/user/status/'

// Helper functions

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


const EditField = ({setCanEdit, setRerenderPosts, postID}) => {
    const editPostURL = Root_URL + `api/posts/${postID}/edit/`

    const [newPostContent, setNewPostContent] = React.useState('')

    const changePostValue = (event) => {
        setNewPostContent(event.target.value)
    }

    const submitPost = async () => {
        console.log('trying to submit a post.')
        console.log(`content: ${newPostContent}`)

        const response = await fetch(editPostURL, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                'content': newPostContent,
            })
        })
        setCanEdit(false)
        setRerenderPosts('A post has been edited.')
    }

    const cancelEdit = () => {
        setCanEdit(false)
    }

    return (
        <div className='post_edit_form'>
            <input type='text' className='post_form_field' value={newPostContent} onChange={changePostValue}></input>

            <div className='post_form_buttons'>
                <button className='btn' onClick={submitPost}> Confirm Changes </button>
                <button className='btn' onClick={cancelEdit}> Cancel </button>
            </div>
        </div>
    )
}

const Post = ({post, setRerenderPosts, userStatus}) => {
    const likeURL = Root_URL + `api/posts/${post.id}/like/`
    const unlikeURL = Root_URL + `api/posts/${post.id}/unlike/`
    const isPostLikedURL = Root_URL + `api/posts/${post.id}/likedby/requestuser/`
    const isPostOwnerURL = Root_URL + `api/posts/${post.id}/isowner/`
    const userProfileURL = Root_URL + `user/${post.user_id}/`

    const [isPostLiked, setIsPostLiked] = React.useState(false)
    const [isPostOwner, setIsPostOwner] = React.useState(false)
    const [canEdit, setCanEdit] = React.useState(false)

    React.useEffect(async () => {
        const isPostlikedResponse = await fetch(isPostLikedURL)
        const isPostlikedData = await isPostlikedResponse.json()

        const isPostOwnerResponse = await fetch(isPostOwnerURL)
        const isPostOwnerData = await isPostOwnerResponse.json()
        
        setIsPostLiked(isPostlikedData.is_post_liked_by_user)
        setIsPostOwner(isPostOwnerData.is_post_owner)
    }, [canEdit])

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

    const toggleEdit = () => {
        setCanEdit(true)
    }

    return (
        <div className='post'>
            <div className='post_label'>
                <div className='post_username'> <a href={userProfileURL}> {post.post_user} </a> </div>
                <div className='post_pubdate'>{post.date_published}</div>
            </div>

            <div className='post_body'>
                {
                    
                    canEdit ?
                        <EditField setCanEdit={setCanEdit} postID={post.id} setRerenderPosts={setRerenderPosts}/>
                    :
                        <div className='post_content'>
                            {post.content}
                        </div>
                }
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

                                {
                                    (isPostOwner && !canEdit ) &&
                                    <button className='btn' onClick={toggleEdit}> Edit </button>
                                }
                        </div>
                }
            </div>
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
            <div id='user_profile_info'>
                <div id='user_profile_name'>
                    <h3> {profileData.name} </h3>

                    <div id='user_profile_following'>
                        <div> Following : {profileData.total_following} </div>
                        <div> Followers : {profileData.total_followers} </div>
                    </div>
                </div>

                <div className='profile_btns'>
                    {
                        (profileData.can_follow && userStatus.authenticated ) && (followed
                        ?
                            <button className='btn' onClick={unfollowUser}> Unfollow </button>
                        :
                            <button className='btn' onClick={followUser}> Follow </button>
                        )
                    }
                </div>
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