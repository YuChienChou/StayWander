import { csrfFetch } from "./csrf";

//redux
//type string
const LOAD_SPOTS = "spots/LOAD_SPOTS";
const RECEIVE_SPOT = "spots/RECEIVE_SPOT";
const UPDATE_SPOT = 'spots/UPDATE_SPOT';
const DELETE_SPOT = 'spots/DELETE_SPOT';
const GET_CURRENT_USER_SPOTs = 'spots/GET_CURRENT_USER_SPOTS';
const CLEAR_SPOT = "spots/CLEAR_SPOT";
const SEARCH_SPOTS = "spots/SEARCH_SPOTS";


//action creator
export const loadSpotsAction = (spots) => ({
    type: LOAD_SPOTS,
    spots
});

export const receiveSpotAction = (spot) => ({
    type: RECEIVE_SPOT,
    spot,
});

export const editSpotAction = (spot) => {
    return {
        type: UPDATE_SPOT,
        spot,
    };
};

export const deleteSpotAction = (spotId) => {
    return {
        type: DELETE_SPOT,
        spotId
    };
};

export const getCurrentUserSpotsAction = (spots) => {
    return {
        type: GET_CURRENT_USER_SPOTs,
        spots
    };
};

export const actionClearSpot = () => {
    return {
        type: CLEAR_SPOT,
    }
};



//thunk action creator

export const loadSpotsThunk = () => async (dispatch) => {
    const res = await csrfFetch('/api/spots');
    
    if(res.ok) {
        const spots = await res.json();
        // console.log("spots in thunk: ", spots);
        dispatch(loadSpotsAction(spots));
        return spots;
    };
};

export const fetchDetailedSpotThunk = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`);

    if(res.ok) {
        const spotDetails =await res.json();
        // console.log("spotDetails in thunk: ", spotDetails);
        dispatch(receiveSpotAction(spotDetails));
        return spotDetails;
    } else {
        const errors = await res.json();
        return errors;
    }
};

export const createSpotThunk = (spot, imagesArray, owner) => async (dispatch) => {
    try {

    const res = await csrfFetch('/api/spots', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spot),
    });

    if(res.ok) {
        const newSpot = await res.json();

        const finalImageArray = [];

        //the imagesArray is passed in from SpotForm
        for (let image of imagesArray) {
            //to assign the spotId to the new image
            image.spotId = newSpot.id;
            const imageRes = await csrfFetch(`/api/spots/${newSpot.id}/images`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(image)
            });

            if(imageRes.ok) {
                const newImage = await imageRes.json();
                finalImageArray.push(newImage);
            } 
            // else {
            //     const errors = await imageRes.json();
            //     return errors;
            // };
            
        }
        newSpot.SpotImages = finalImageArray;
        newSpot.owner = owner;

        dispatch(receiveSpotAction(newSpot));
        return newSpot;
    } 
    // else {
    //     const errors = await res.json();
    //     return errors;
    // }
    } catch (err) {
            const error = await err.json();
            return error;
        }
};

export const updateSpotThunk = (spot) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spot.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spot),
    });

    if(res.ok) {
        const editedSpot = await res.json()

        dispatch(receiveSpotAction(editedSpot));
        return editedSpot;
    } else {
        const errors = await res.json();
        return errors;
    }
};

export const deletSpotThunk = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`, {
        method: "DELETE",
    });

    if(res.ok) {
        dispatch(deleteSpotAction(spotId));
        return;
    } else {
        const errors = await res.json();
        return errors;
    };
};

export const getCurrentUserSpotsThunk = () => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/current`);

    if(res.ok) {
        const userSpots = await res.json();
        dispatch(loadSpotsAction(userSpots));
        return userSpots;
    } else {
        const errors = await res.json();
        return errors;
    };

};

export const searchSpotThunk = (query) => async (dispatch) => {

    try {
        const res = await csrfFetch(`/api/spots/${query}`);

        if(res.ok) {
            const spots = await res.json();
            dispatch(loadSpotsAction(spots));
            return spots;
        }
    } catch(err) {
        const errors = await err.json();
        console.log("errors in spot reducer: ", errors)
        return errors;
    }
}

//reducer: case in the reducer for all user reviews
//normalize review data


// const initialState = {};

const initialState = {allState:{}, singleSpot:{}}

const spotsReducer = (state = initialState, action) => {
    switch(action.type) {

        case LOAD_SPOTS: {

            const newState = {};
            action.spots.Spots.forEach((spot) => {
                newState[spot.id] = spot;
            });
            
            // console.log("newState in spot reducer: ", newState);
    
            return newState;
            
        };
        case RECEIVE_SPOT: {
            const spotState = {...state, singleSpot: {[action.spot.id]: action.spot}}
            // console.log("single spot in Spot reducer: ", spotState.singleSpot);
            return spotState.singleSpot; 
        };
        case UPDATE_SPOT: {
            const spotState = {...state, singleSpot: {[action.spot.id]: action.spot}}
            return spotState.singleSpot;
        };
        case DELETE_SPOT: {
            const spotsState = {...state};
            delete spotsState[action.spotId];
            return spotsState;
        };
        case GET_CURRENT_USER_SPOTs: {
            const spotsState = {...state};
            // console.log("spotsState in spot reducer: ", spotsState);
            action.spots.Spots.forEach((spot) => {
                spotsState[spot.id] = spot;
            })
            return spotsState;
        };
        case CLEAR_SPOT: {
            return {}
        }
        default:
            return state;
        
    }
};

export default spotsReducer;

