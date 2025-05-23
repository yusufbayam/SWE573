import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { API_ENDPOINTS } from "../constants/config";
import { formatDate } from "../utils/dateUtils";
import "../ConnectTheDots.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const [ownedSpaces, setOwnedSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bio: "",
    profession: "",
  });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PROFILE(username));
        setUser(response.data);
        setJoinedSpaces(response.data.joined_spaces);
        setOwnedSpaces(response.data.owned_spaces || []);

        const currentUsername = localStorage.getItem("username");
        const isCurrentUserProfile = currentUsername === username;
        setIsCurrentUser(isCurrentUserProfile);

        setEditFormData({
          bio: response.data.bio || "",
          profession: response.data.profession || "",
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const handleEditClick = () => {
    setIsEditing(true);
    // Clear any previous errors when entering edit mode
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      bio: user.bio || "",
      profession: user.profession || "",
    });
    // Clear any errors when cancelling
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      user.profession &&
      user.profession.trim() !== "" &&
      (!editFormData.profession || editFormData.profession.trim() === "")
    ) {
      setError("Profession cannot be emptied once set");
      return;
    }

    try {
      const response = await api.put(
        API_ENDPOINTS.UPDATE_PROFILE,
        editFormData
      );
      setUser(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update profile data");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      {error && (
        <div className="error-message" data-testid="profile-error">
          <span>{error}</span>
        </div>
      )}
      <div className="profile-header">
        <h1>{user?.user?.username}'s Profile</h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="profession">Profession:</label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={editFormData.profession}
                onChange={handleInputChange}
                maxLength={100}
                required={user.profession !== null && user.profession !== ""}
              />
              <small className="field-note">
                Profession cannot be empty once set
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio (max 200 words):</label>
              <textarea
                id="bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleInputChange}
                maxLength={200}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {user?.profession && (
              <p className="profession">Profession: {user.profession}</p>
            )}
            <p className="bio">Bio: {user?.bio || "-"}</p>
            {user?.dob && (
              <p className="dob">Date of Birth: {formatDate(user.dob)}</p>
            )}
            {user?.created_at && (
              <p className="created-at">
                Joined: {formatDate(user.created_at)}
              </p>
            )}
            {isCurrentUser && (
              <button onClick={handleEditClick} className="edit-profile-button">
                Edit Profile
              </button>
            )}
          </>
        )}
      </div>

      <div className="profile-content">
        <div className="owned-spaces">
          <h2>Owned Spaces</h2>
          {ownedSpaces.length > 0 ? (
            <div className="spaces-grid">
              {ownedSpaces.map((space) => (
                <div
                  key={space.id}
                  className="space-card"
                  onClick={() => navigate(`/spaces/${space.id}`)}
                >
                  <h3>{space.title}</h3>
                  <p>{space.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No owned spaces</p>
          )}
        </div>

        <div className="joined-spaces">
          <h2>Joined Spaces</h2>
          {joinedSpaces.length > 0 ? (
            <div className="spaces-grid">
              {joinedSpaces.map((space) => (
                <div
                  key={space.id}
                  className="space-card"
                  onClick={() => navigate(`/spaces/${space.id}`)}
                >
                  <h3>{space.title}</h3>
                  <p>{space.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No spaces joined yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
