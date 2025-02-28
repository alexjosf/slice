import { create } from 'zustand';
import auth from '@react-native-firebase/auth'
import firestore, { Timestamp } from '@react-native-firebase/firestore';

import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();


const userDataStore = create((set, get) => ({
  userData: [], // Entire user data.
  userCountry: '', // User country for currency

  groupID: [], // All the group ID's
  friendID: [], // ID of all the friends
  transactionID: [], // All the traction id's from friends

  friendData: [], // Transactions of each user

  transactionData: [], // Details of each transactions

  groupDetails: storage.getString("groupDetails") ? JSON.parse(storage.getString("groupDetails")) : [], // Details of each groups

  friendDetails: storage.getString("friendDetails") ? JSON.parse(storage.getString("friendDetails")) : [], // Details of each friends

  transactionsFriend: [], // The transactions of single friend
  balanceAmountFriends: {}, // Balance amount of each friends
  transactionsGroup: [], // Transactions that in a group.

  getUserDataFromFireStore: async () => {
    // storage.clearAll()

    //Get user data
    firestore().collection("Users").doc(auth().currentUser.uid).onSnapshot((documentSnapshot) => {
      if (documentSnapshot) {
        set({ userData: documentSnapshot.data() })
        set({ userCountry: documentSnapshot.data().country })
        set({ groupID: documentSnapshot.data().groups })
      }
    })
  },

  getIDFromFireStore: async () => {

    if (auth().currentUser) {
      //Get the friend Id's and transaction Id's
      firestore().collection("Users")
        .doc(auth().currentUser.uid)
        .collection("Friends").onSnapshot((querySnapshot) => {
          let transactionIdTemp = [];
          let friendIdTemp = [];
          let balanceTemp = {};
          let friendDataTemp = {};
          querySnapshot.forEach(
            (document) => {
              if (document.exists && document.data().transactions) {
                let item = document.data().transactions
                // Transaction ids
                transactionIdTemp.push(Object.keys(item))
              }
              // The list of friend ids
              friendIdTemp.push(document.ref.id)
              // Friend Id and their balance amount
              balanceTemp[document.data().uid] = document.data().balanceAmount
              // Friend Id and their transaction ids
              friendDataTemp[document.data().uid] = document.data().transactions
            }
          )

          set({ transactionID: [...new Set(transactionIdTemp.flat(1))] })

          set({ friendID: friendIdTemp })

          set({ balanceAmountFriends: balanceTemp })

          set({ friendData: friendDataTemp })

          
          console.log('Called inside snapshot')

          //Get transaction details from firestore database
          if (storage.contains('transactionData')) {
            let transactionID = get().transactionID

            console.log('Called inside transaction function')

            let convertedTransactions = JSON.parse(storage.getString('transactionData')).map(txn => ({
              ...txn,
              date: new Timestamp(txn.date.seconds, txn.date.nanoseconds) // Convert timestamp
            }));

            const arrayIds = convertedTransactions.map(obj => obj.tid);

            const addedIds = transactionID.filter(item => !arrayIds.includes(item));
            const deletedIds = arrayIds.filter(item => !transactionID.includes(item));

            addedIds.forEach((item) => {
              firestore().collection("Transactions").doc(item).get()
                .then((document) => {
                  if (document.exists) {
                    convertedTransactions.push(document.data())
                  }
                })
            })

            deletedIds.forEach((item) => {
              let temp = convertedTransactions
              filteredArray = temp.filter(map => map.tid !== item);
              convertedTransactions = filteredArray
            })

            set({ transactionData: convertedTransactions })
            storage.set('transactionData', JSON.stringify(convertedTransactions))
          }
          else {
            //// Need editing At this part
            let transactionTemp = []

            get().transactionID.forEach((item) => {

              firestore().collection("Transactions").doc(item).get()
                .then((document) => {
                  if (document.exists) {
                    transactionTemp.push(document.data())
                    set({ transactionData: transactionTemp })
                    storage.set('transactionData', JSON.stringify(transactionTemp))
                  }
                })
            })
          }
        })

    }
  },

  // Used with react-query
  getFriendDataFireStore: async () => {
      let friendsTemp = []
      const friendPromises = get().friendID.map(async (item) => {
        const document = await firestore().collection("Users").doc(item).get();
        if (document.exists) { friendsTemp.push(document.data()) }
      });
      // Wait for all promises to resolve before updating Zustand state
      await Promise.all(friendPromises);
      set({ friendDetails: friendsTemp });
      storage.set('friendDetails', JSON.stringify(friendsTemp))
      return friendsTemp
  },

  // Used with react-query
  getGroupDataFireStore: async () => {
    //Get group details from firestore database.
    let groupsTemp = []
    const groupPromises = get().groupID.map(async (item) => {
      const document = await firestore().collection("Groups").doc(item).get();
      if (document.exists) { groupsTemp.push(document.data()) }
    });
    // Wait for all promises to resolve before updating Zustand state.
    await Promise.all(groupPromises);
    set({ groupDetails: groupsTemp });
    storage.set('groupDetails', JSON.stringify(groupsTemp))
    return groupsTemp

  },

  getTransactionFriend: async (uId) => {
    let temp = [];
    get().transactionData.forEach(
      (document) => {
        if (document && (document.members).includes(uId)) {
          temp.push(document)
        }
      }
    )
    let temp2 = temp.sort((a, b) => b.date.toDate() - a.date.toDate());
    set({ transactionsFriend: [...temp2] })
  },

  getTransactionGroup: async (gId) => {
    let temp = [];
    get().transactionData.forEach(
      (document) => {
        if (document.group == gId) {
          temp.push(document)
        }
      }
    )
    let temp2 = temp.sort((a, b) => b.date.toDate() - a.date.toDate());
    set({ transactionsGroup: [...temp2] })
  },

}));

export default userDataStore;