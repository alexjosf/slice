import { create } from 'zustand';
import auth from '@react-native-firebase/auth'
import firestore, { firebase } from '@react-native-firebase/firestore';

const userDataStore = create((set, get) => ({
  userData: [], // ntire user data.
  userCountry: '', // User country for currency

  groupID: [], // All the group ID's
  friendID: [], // ID of all the friends
  transactionID: [], // All the traction id's from friends

  friendData: [], // Transactions of each user


  groupDetails: {}, // Details of each groups
  friendDetails: {}, // Details of each friends
  transactionData: [], // Details of each transactions

  transactionsFriend: [], // The transactions of single friend
  balanceAmountFriends: {}, // Balance amount of each friends


  transactionsGroup: [], // Transactions that in a group.

  transactionDataLoading: true,
  friendDataLoading: true,
  groupDataLoading: true,

  getUserDataFromFireStore: async () => {
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
      await firestore().collection("Users")
        .doc(auth().currentUser.uid)
        .collection("Friends").get().then((document) => {
          let transactionIdTemp = [];
          let friendIdTemp = [];
          let balanceTemp = {};
          let friendDataTemp = {};
          document.docs.forEach(
            (document) => {
              if (document.exists && document.data().transactions) {
                let item = document.data().transactions
                transactionIdTemp.push(Object.keys(item))
              }
              friendIdTemp.push(document.ref.id)
              balanceTemp[document.data().uid] = document.data().balanceAmount
              friendDataTemp[document.data().uid] = document.data().transactions
            }
          )
          set({ transactionID: [...new Set(transactionIdTemp.flat(1))] })
          set({ friendID: friendIdTemp })
          set({ balanceAmountFriends: balanceTemp })
          set({ friendData: friendDataTemp })
        })
        .catch(
          (error) => { console.log(error) }
        )

      //Get transaction details from firestore database
      let transactionTemp = []
      get().transactionID.forEach((item) => {
        firestore().collection("Transactions").doc(item).get()
          .then((document) => {
            if (document.exists) {
              transactionTemp.push(document.data())
              set({ transactionData: transactionTemp })
            }
          })
      })
    }
  },

  // Used with react-query
  getFriendDataFireStore: async () => {
    //Get friend details from firestore database
    let friendsTemp = {};
    const friendPromises = get().friendID.map(async (item) => {
      const document = await firestore().collection("Users").doc(item).get();
      if (document.exists) { friendsTemp[document.data().uid] = document.data() }
    });
    // Wait for all promises to resolve before updating Zustand state
    await Promise.all(friendPromises);
    set({ friendDetails: friendsTemp });
    return Object.values(friendsTemp)
  },

  // Used with react-query
  getGroupDataFireStore: async () => {
    //Get group details from firestore database.
    let groupsTemp = {}
    const groupPromises = get().groupID.map(async (item) => {
      const document = await firestore().collection("Groups").doc(item).get();
      if (document.exists) { groupsTemp[document.data().gid] = document.data() }
    });
    // Wait for all promises to resolve before updating Zustand state.
    await Promise.all(groupPromises);
    set({ groupDetails: groupsTemp });
    return Object.values(groupsTemp)

  },

  updateBalanceAmountLive: (uId, amount) => {
    set((state) => ({
      balanceAmountFriends: {
        ...state.balanceAmountFriends,
        [uId]: amount,  // this changed for current user in friend main
      },
    }));
  },

  updateExpenseLive: (transaction) => {
    set({ transactionData: [...get().transactionData, transaction] })
  },

  getTransactionFriend: async (uId, newTransaction) => {
    if (uId) {
      let oldTransaction = get().friendData[uId]
      let oldTransactionID = Object.keys(oldTransaction)
      let newTransactionID = Object.keys(newTransaction)
      const addedTransaction = newTransactionID.filter(item => !oldTransactionID.includes(item));
      console.log(addedTransaction)
      ///////////////////need edit if more transaction is present need to alter change.

      if (addedTransaction.length == 1) {
        await firestore().collection("Transactions").doc(addedTransaction[0]).get()
          .then((document) => {
            let temp = get().transactionData
            if (!temp.some(item => item.tid === document.data().tid)) {
              temp.push(document.data())
              set({ transactionData: temp })
              set((state) => ({
                friendData: {
                  ...state.friendData,
                  [uId]: newTransaction,  // this changed for  current user in friend main
                },
              }))
            }
          })
      }

      const deletedTransaction = oldTransactionID.filter(item => !newTransactionID.includes(item));
      ///////////////////need edit if more transaction is present need to alter change.
      if (deletedTransaction.length == 1) {
        //need editing
        let temp = get().transactionData
        filteredArray = temp.filter(map => map.tid !== deletedTransaction[0]);
        if (filteredArray !== temp) {
          set({ transactionData: filteredArray })
          set((state) => ({
            friendData: {
              ...state.friendData,
              [uId]: newTransaction,  // this changed for  current user in friend main
            },
          }))
        }
      }

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
    }
  },

  getTransactionGroup: async (gId, newTransaction) => {

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