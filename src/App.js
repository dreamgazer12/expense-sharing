import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    doc, 
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

// --- Helper Functions & Constants ---

// IMPORTANT: These are placeholders. In a real environment, these would be provided.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-splitify-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SVG Icons ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mx-2 text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);

// --- Authentication Component ---
function AuthComponent({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                if (!displayName.trim()) {
                    setError("Please enter a display name.");
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Create a user document in Firestore
                await setDoc(doc(db, `artifacts/${appId}/public/data/users`, userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: displayName,
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Splitify</h1>
                <p className="text-center text-gray-500 mb-8">Share expenses with friends, simply.</p>
                <div className="bg-white p-8 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        {isSignUp && (
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your Name"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
                        >
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-600 hover:underline ml-1">
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- Add Expense Modal Component ---
function AddExpenseModal({ setShowModal, users, currentUser }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(currentUser.uid);
    const [splitWith, setSplitWith] = useState(users.map(u => u.uid));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSplitWithChange = (uid) => {
        setSplitWith(prev => 
            prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const numericAmount = parseFloat(amount);
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid description and a positive amount.');
            return;
        }
        if (splitWith.length === 0) {
            setError('You must split the expense with at least one person.');
            return;
        }

        setLoading(true);
        try {
            const share = numericAmount / splitWith.length;
            const splitDetails = splitWith.map(uid => ({
                uid,
                share: parseFloat(share.toFixed(2))
            }));
            
            // Adjust for rounding errors on the last person
            const totalCalculated = splitDetails.reduce((sum, s) => sum + s.share, 0);
            const roundingDiff = numericAmount - totalCalculated;
            if (Math.abs(roundingDiff) > 0.001) {
                 splitDetails[splitDetails.length - 1].share += roundingDiff;
            }

            await addDoc(collection(db, `artifacts/${appId}/public/data/expenses`), {
                description,
                amount: numericAmount,
                paidBy,
                splitWith: splitDetails,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
            });
            setShowModal(false);
        } catch (err) {
            console.error("Error adding expense:", err);
            setError('Failed to add expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Expense</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Dinner, Groceries"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
                        <select
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {users.map(user => (
                                <option key={user.uid} value={user.uid}>
                                    {user.uid === currentUser.uid ? 'You' : user.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Split with</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                            {users.map(user => (
                                <label key={user.uid} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={splitWith.includes(user.uid)}
                                        onChange={() => handleSplitWithChange(user.uid)}
                                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-800">{user.displayName} {user.uid === currentUser.uid && '(You)'}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Dashboard Component ---
function Dashboard({ user, users, expenses }) {
    const [showModal, setShowModal] = useState(false);
    
    const simplifiedDebts = useMemo(() => {
        // This function calculates who owes whom.
        const balances = {};
        users.forEach(u => balances[u.uid] = 0);

        expenses.forEach(expense => {
            balances[expense.paidBy] += expense.amount;
            expense.splitWith.forEach(split => {
                balances[split.uid] -= split.share;
            });
        });

        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([uid, balance]) => {
            if (balance > 0.01) {
                creditors.push({ uid, amount: balance });
            } else if (balance < -0.01) {
                debtors.push({ uid, amount: -balance });
            }
        });

        const settlements = [];
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(debtor.amount, creditor.amount);

            settlements.push({
                from: debtor.uid,
                to: creditor.uid,
                amount: amount
            });

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }
        return settlements;
    }, [expenses, users]);
    
    const { totalOwedToYou, totalYouOwe } = useMemo(() => {
        let owedToYou = 0;
        let youOwe = 0;
        simplifiedDebts.forEach(debt => {
            if (debt.to === user.uid) {
                owedToYou += debt.amount;
            }
            if (debt.from === user.uid) {
                youOwe += debt.amount;
            }
        });
        return { totalOwedToYou: owedToYou, totalYouOwe: youOwe };
    }, [simplifiedDebts, user.uid]);

    const getUserName = (uid) => users.find(u => u.uid === uid)?.displayName || 'Someone';
    
    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [expenses]);


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-gray-800">Hi, {user.displayName}</h1>
                <button onClick={() => signOut(auth)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    Log Out
                </button>
            </header>

            <main className="p-4 md:p-6">
                {/* Balance Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-100 p-4 rounded-xl">
                        <p className="text-sm text-green-800">You are owed</p>
                        <p className="text-2xl font-bold text-green-900">${totalOwedToYou.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl">
                        <p className="text-sm text-red-800">You owe</p>
                        <p className="text-2xl font-bold text-red-900">${totalYouOwe.toFixed(2)}</p>
                    </div>
                </div>

                {/* Simplified Debts Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    <h2 className="font-bold text-gray-800 mb-3">Who Owes Who</h2>
                    {simplifiedDebts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">🎉 Everyone is settled up!</p>
                    ) : (
                        <ul className="space-y-3">
                            {simplifiedDebts.map((debt, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className={`font-semibold ${debt.from === user.uid ? 'text-red-600' : 'text-gray-800'}`}>
                                            {debt.from === user.uid ? 'You' : getUserName(debt.from)}
                                        </span>
                                        <ArrowRightIcon />
                                        <span className={`font-semibold ${debt.to === user.uid ? 'text-green-600' : 'text-gray-800'}`}>
                                            {debt.to === user.uid ? 'You' : getUserName(debt.to)}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-900">${debt.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Expenses List */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-3">Recent Expenses</h2>
                    {sortedExpenses.length === <strong> 0 </strong> ? (
                        <p className="text-gray-500 text-center py-4">No expenses added yet. Add one to get started!</p>
                    ) : (
                        <ul className="space-y-3">
                            {sortedExpenses.map(expense => {
                                const payer = users.find(u => u.uid === expense.paidBy);
                                const isYou = payer?.uid === user.uid;
                                const yourShare = expense.splitWith.find(s => s.uid === user.uid)?.share;
                                
                                return (
                                    <li key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-800">{expense.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {isYou ? 'You' : payer?.displayName} paid ${expense.amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            {yourShare ? (
                                                <div className="text-right">
                                                    <p className="font-semibold text-red-600">you owe</p>
                                                    <p className="text-sm text-red-600">${yourShare.toFixed(2)}</p>
                                                </div>
                                            ) : (
                                                <div className="text-right text-green-600">
                                                    <CheckCircleIcon />
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </main>

            {/* Add Expense Button */}
            <div className="fixed bottom-6 right-6">
                <button 
                    onClick={() => setShowModal(true)} 
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Add new expense"
                >
                    <PlusIcon />
                </button>
            </div>

            {showModal && <AddExpenseModal setShowModal={setShowModal} users={users} currentUser={user} />}
        </div>
    );
}


// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // Effect for handling authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // For non-anonymous users, we expect a document in Firestore.
                // We listen to that document to get their profile (e.g., displayName).
                if (!firebaseUser.isAnonymous) {
                    const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, firebaseUser.uid);
                    const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setUser({ ...firebaseUser, ...docSnap.data() });
                        } else {
                            // User is in Auth, but not in Firestore. This is an inconsistent state
                            // for a non-anonymous user. Could be a race condition on signup.
                            // Setting user to the firebaseUser will keep them on the auth screen if they lack a displayName.
                            setUser(firebaseUser);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Error fetching user profile:", error);
                        signOut(auth); // Sign out on error to prevent being stuck.
                        setLoading(false);
                    });
                    return () => unsubscribeDoc();
                } else {
                    // It's an anonymous user. They don't have a profile doc.
                    // Just set the basic user object. They will stay on the AuthComponent page.
                    setUser(firebaseUser);
                    setLoading(false);
                }
            } else {
                // No user is logged in.
                setUser(null);
                 // Try to sign in with token or anonymously on initial load.
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Initial sign-in failed", error);
                    // If sign-in fails, stop loading so the auth page can be shown.
                    setLoading(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Effect for fetching all users and expenses when a user is logged in
    useEffect(() => {
        // We only proceed if we have a user with a displayName. This is our app's
        // definition of a "fully logged-in" user who is authorized to see data.
        if (!user || !user.displayName) {
            setUsers([]);
            setExpenses([]);
            return;
        }

        // Fetch all users
        const usersQuery = query(collection(db, `artifacts/${appId}/public/data/users`));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        }, (error) => {
            console.error("Permission denied fetching users. Check Firestore rules.", error);
        });

        // Fetch all expenses
        const expensesQuery = query(collection(db, `artifacts/${appId}/public/data/expenses`));
        const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(expensesData);
        }, (error) => {
            console.error("Permission denied fetching expenses. Check Firestore rules.", error);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeExpenses();
        };
    }, [user]); // This effect correctly depends on the user object.

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <p className="text-lg font-semibold text-gray-600">Loading your dashboard...</p>
            </div>
        );
    }

    // Render Auth or Dashboard based on user state
    return user && user.displayName ? <Dashboard user={user} users={users} expenses={expenses} /> : <AuthComponent setUser={setUser} />;
}
