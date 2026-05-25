import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {
  Search,
  Trash2,
  User,
  Users,
  ArrowLeft,
  Plus,
  Check,
  Lock,
  PenLine,
} from "lucide-react";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────
// LISTS VIEW
// ─────────────────────────────────────────────
const ListsView = ({ lists, onNewList, onOpenDetail, onEdit, onDelete, onBack }) => (
  <div className="min-h-screen bg-[#14161b] text-white">
    <div className="max-w-4xl mx-auto px-6 pb-20">
      {/* Tab header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] mb-0">
        <div className="flex gap-6">
          <BiArrowBack
            className="w-8 h-8 mt-3 cursor-pointer text-white hover:text-blue-500"  
            onClick={onBack}
          />
          <hr className="border-gray-700 mt-4  mb-10" />

          <p className="text-[11px] font-bold tracking-[0.08em] mt-4 -ml-8 uppercase text-white/40">
            Your Lists
          </p>
        </div>
      </div>

      {/* New list button */}
      <button
        onClick={onNewList}
        className="flex ml-auto gap-2 bg-gray-500 hover:bg-[#00c94b] text-white text-sm font-semibold tracking-[0.08em]  px-4 py-2.5 rounded my-5 transition"
      >
        Start a New List ...
      </button>

      {/* Empty state */}
      {lists.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <Users size={40} className="text-white/10" />
          <p className="text-white/40 text-sm font-medium">No lists yet</p>
          <p className="text-white/20 text-xs">
            Create your first people collection above
          </p>
        </div>
      ) : (
        <div>
          {lists.map((list) => {
            const count = list.people?.length || 0;
            const countText =
              count === 0
                ? "No people"
                : count === 1
                  ? "1 person"
                  : `${count} people`;
            const shown = (list.people || []).slice(0, 5);

            return (
              <div
                key={list._id}
                onClick={() => onOpenDetail(list)}
                className="group flex items-center gap-5 py-4 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.025] -mx-3 px-3 rounded transition"
              >
                {/* Avatar grid — like Letterboxd's poster grid */}
                <div className="w-[112px] h-[64px] flex-shrink-0 grid grid-cols-5 gap-px rounded overflow-hidden bg-white/[0.06]">
                  {count === 0 ? (
                    <div className="col-span-4 row-span-1 flex items-center justify-center">
                      <User size={18} className="text-white/20" />
                    </div>
                  ) : (
                    <>
                      {shown.map((p, i) => (
                        <div
                          key={i}
                          className="bg-white/[0.08] flex items-center justify-center overflow-hidden"
                        >
                          {p.profile_path ? (
                            <img
                              src={`${TMDB_IMAGE_BASE}${p.profile_path}`}
                              alt={p.name}
                              className="w-20 h-20 object-cover"
                            />
                          ) : (
                            <span className="text-[8px] font-bold text-white/30">
                              {getInitials(p.name)}
                            </span>
                          )}
                        </div>
                      ))}
                      {/* Fill empty cells */}
                      {Array(Math.max(0, 4 - shown.length))
                        .fill(null)
                        .map((_, i) => (
                          <div key={`empty-${i}`} className="bg-white/[0.04]" />
                        ))}
                    </>
                  )}
                </div>

                {/* List meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[15px] font-semibold text-white">
                      {list.name}
                    </p>
                    {list.private && (
                      <Lock size={11} className="text-white/30 flex-shrink-0" />
                    )}
                    {list.ranked && (
                      <span className="text-[10px] font-medium bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-px text-white/30">
                        Ranked
                      </span>
                    )}
                  </div>
                  <p className="text-md  text-white/35">
                    {countText}
                    {list.note && (
                      <span className="block text-gray-500"> {list.note}</span>
                    )}
                  </p>
                </div>

                {/* Hover actions */}
                <div
                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEdit(list)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] px-3 py-1.5 rounded transition"
                  >
                    <PenLine size={11} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(list._id)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-white/[0.1] hover:bg-red-500/10 hover:border-red-500/30 transition"
                  >
                    <Trash2
                      size={13}
                      className="text-white/30 hover:text-red-400 transition"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const FormView = ({
  isEdit,
  editName,
  setEditName,
  editNote,
  setEditNote,
  editPrivate,
  setEditPrivate,
  editRanked,
  setEditRanked,
  people,
  query,
  setQuery,
  searchResults,
  onAdd,
  onRemove,
  onSave,
  onCancel,
  searchRef,
}) => (
  <div className="min-h-screen bg-[#14161b] text-white">
    <div className="max-w-4xl mx-auto px-6 pb-20">
      <BiArrowBack
        className="w-8 h-8 mt-3 cursor-pointer text-white hover:text-blue-500"
        onClick={onCancel}
      />
      

      {/* Page title */}
      <div className="py-6  mb-6">
        <h1 className="text-2xl -mt-14 ml-14 font-semibold text-white">
          {isEdit ? "Edit List" : "New List"}
        </h1>
      </div>
      <hr className="border-gray-700 -mt-12  mb-10" />

      {/* Form grid */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] -ml-3 font-semibold tracking-[0.08em] uppercase text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e054] inline-block" />
            Name
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.1] focus:border-white/30 rounded text-black text-sm px-3 py-2.5 outline-none transition placeholder-white/20"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 row-span-2">
          <label className="text-[11px] -mt-3 font-semibold tracking-[0.08em] uppercase text-white/50 flex items-center justify-between">
            Description
          </label>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows={5}
            placeholder="Optional description…"
            className="bg-white/[0.05] border border-white/[0.1] focus:border-white/30 rounded text-black text-sm px-3 py-2.5 outline-none transition resize-none placeholder-white/20"
          />
        </div>

        {/* Ranked */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="ranked"
              checked={editRanked}
              onChange={(e) => setEditRanked(e.target.checked)}
              className="w-4 h-4 accent-[#00e054] cursor-pointer"
            />
            <label
              htmlFor="ranked"
              className="text-sm text-white/70 cursor-pointer"
            >
              Ranked list
            </label>
            <span className="text-xs ml-32 text-gray-500">
              Show position for each person.
            </span>
          </div>
        </div>
      </div>

      {/* ADD A PERSON bar + search */}
      <div className="border-t border-white/[0.07] pt-5">
        <div className="flex items-center gap-0 relative mb-8" ref={searchRef}>
          <p  className="bg-[#00e054] hover:bg-[#00c94b] text-white bg-green-800 text-[11px] font-bold tracking-[0.08em] uppercase px-4 py-[10px] rounded-l flex-shrink-0 transition">
            ADD A PERSON
          </p>
          <input
          
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name of person…"
            className="bg-[#1e2028] border border-white/[0.1] border-l-0 text-black text-sm px-4 py-[10px] outline-none flex-1 placeholder-white/20 rounded-r focus:border-white/25 transition"
          />

          {/* Search dropdown */}
          {searchResults.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-gray-400 border border-white/[0.1] rounded overflow-hidden z-50 shadow-2xl">
              {searchResults.map((person, idx) => {
                const already = people.some(
                  (p) => p.tmdb_person_id === person.id,
                );
                return (
                  <li
                    key={person.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.05] last:border-0 transition ${
                      idx === 0
                        ? "bg-[#00e054] text-white"
                        : "hover:bg-[#00e054] hover:text-white"
                    }`}
                    onClick={() => !already && onAdd(person)}
                  >
                    {person.profile_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE}${person.profile_path}`}
                        alt={person.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(person.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {person.name}{" "}
                        <span className="font-normal opacity-60 text-xs">
                          ({person.known_for_department})
                        </span>
                      </p>
                    </div>
                    {already && (
                      <span className="text-xs opacity-50 font-medium">
                        Added
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            <button
              onClick={onCancel}
              className="text-[10px] font-bold tracking-[0.04em] uppercase text-white/40 hover:text-white/70 bg-gray-700 hover:bg-white/[0.08] border border-white/[0.1] px-1 py-0 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="text-[11px] font-bold tracking-[0.06em] uppercase text-white/40 hover:text-white/70  bg-green-800 hover:bg-[#00c94b] border border-white/[0.1] px-1 py-0 rounded transition"
            >
              Save
            </button>
          </div>
        </div>

        {/* Added people list */}
        {people.length === 0 ? (
          <div className="mt-6 border border-dashed border-white/[0.08] rounded p-10 text-center">
            <p className="text-white/30 text-sm font-semibold">
              Your list is empty.
            </p>
            <p className="text-white/20 text-xs mt-1">
              Add people using the field above.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-1">
            {people.map((person, i) => (
              <div
                key={person._id || person.id}
                className="flex items-center gap-4 py-3 border-b border-white/[0.05] group"
              >
                {editRanked && (
                  <span className="text-[11px] font-bold text-white/20 w-5 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                )}
                {person.profile_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${person.profile_path}`}
                    alt={person.name}
                    className="w-9 h-9 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-white/[0.07] flex items-center justify-center text-xs font-bold text-white/30 flex-shrink-0">
                    {getInitials(person.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {person.name}
                  </p>
                  <p className="text-xs text-white/30 mt-px">
                    {person.known_for_department || person.dept}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(person.tmdb_person_id || person.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/10 transition"
                >
                  <Trash2
                    size={13}
                    className="text-white/30 hover:text-red-400 transition"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const DetailView = ({ list, onBack, onEdit }) => (
  <div className="min-h-screen bg-[#14161b] text-white">
    <div className="max-w-4xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 hover:text-white/60 transition"
        >
          <ArrowLeft size={13} />
          Back
        </button>
      </div>

      <div className="border-b border-white/[0.07] pb-6 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          {list.name}
        </h1>
        {list.note && <p className="text-white/30 text-sm mt-2">{list.note}</p>}
      </div>

      {(list.people || []).length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <User size={40} className="text-white/10" />
          <p className="text-white/40 text-sm">No people in this list</p>
          <button
            onClick={() => onEdit(list)}
            className="text-[11px] font-bold tracking-[0.06em] uppercase text-black bg-[#00e054] hover:bg-[#00c94b] px-4 py-2 rounded mt-2 transition"
          >
            Add People
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-5">
          {(list.people || []).map((person, i) => (
            <Link
              key={person._id}
              to={`/person/${person.tmdb_person_id}`}
              className="flex flex-col items-center text-center group gap-2"
            >
              <div className="w-full aspect-square rounded overflow-hidden bg-white/[0.06] flex items-center justify-center">
                {person.profile_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:opacity-80 transition"
                  />
                ) : (
                  <span className="text-lg font-bold text-white/20 group-hover:text-white/40 transition">
                    {getInitials(person.name)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/70 group-hover:text-white leading-tight transition">
                  {person.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
);

const PeoplePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  }

  const [view, setView] = useState("lists");
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [editRanked, setEditRanked] = useState(false);
  const [editPeople, setEditPeople] = useState([]);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchLists();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      clearTimeout(debounceRef.current);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          "https://api.themoviedb.org/3/search/person",
          {
            params: { api_key: TMDB_API_KEY, query },
          },
        );
        setSearchResults(data.results.slice(0, 5));
      } catch (err) {
        console.error("TMDB search error:", err);
      }
    }, 300);
  }, [query]);

  const fetchLists = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/people/${userId}`);
      setLists(data);
    } catch (err) {
      console.error("Error fetching lists:", err);
    }
  };

  const fetchListById = async (listId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/people/list/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      console.error("Error fetching list:", err);
      return null;
    }
  };

  const openForm = async (list = null) => {
    if (list) {
      const fresh = await fetchListById(list._id);
      const target = fresh || list;
      setSelectedList(target);
      setEditName(target.name);
      setEditNote(target.note || "");
      setEditPrivate(target.private || false);
      setEditRanked(target.ranked || false);
      setEditPeople(target.people || []);
      setIsEditMode(true);
    } else {
      setSelectedList(null);
      setEditName("");
      setEditNote("");
      setEditPrivate(false);
      setEditRanked(false);
      setEditPeople([]);
      setIsEditMode(false);
    }
    setQuery("");
    setSearchResults([]);
    setView("form");
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      if (isEditMode && selectedList) {
        const { data } = await axios.put(
          `${API_URL}/api/people/list/${selectedList._id}`,
          {
            name: editName,
            note: editNote,
            private: editPrivate,
            ranked: editRanked,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setLists((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      } else {
        const { data } = await axios.post(
          `${API_URL}/api/people/${userId}`,
          {
            name: editName,
            note: editNote,
            private: editPrivate,
            ranked: editRanked,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setLists((prev) => [data, ...prev]);
      }
      setView("lists");
    } catch (err) {
      console.error("Error saving list:", err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/people/list/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists((prev) => prev.filter((l) => l._id !== listId));
    } catch (err) {
      console.error("Error deleting list:", err);
    }
  };

  const handleAdd = async (person) => {
    if (!selectedList && !isEditMode) {
      // Adding to new list (not yet created) — optimistic local add
      const already = editPeople.some((p) => p.tmdb_person_id === person.id);
      if (already) return;
      setEditPeople((prev) => [
        ...prev,
        {
          id: person.id,
          tmdb_person_id: person.id,
          name: person.name,
          profile_path: person.profile_path || "",
          known_for_department: person.known_for_department || "",
        },
      ]);
      setQuery("");
      setSearchResults([]);
      return;
    }
    if (!selectedList) return;
    const already = editPeople.some((p) => p.tmdb_person_id === person.id);
    if (already) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_URL}/api/people/list/${selectedList._id}/add`,
        {
          tmdb_person_id: person.id,
          name: person.name,
          profile_path: person.profile_path || "",
          known_for_department: person.known_for_department || "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedList(data);
      setEditPeople(data.people || []);
      setLists((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      setQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Error adding person:", err);
    }
  };

  const handleRemove = async (tmdbPersonId) => {
    if (!selectedList) {
      setEditPeople((prev) =>
        prev.filter((p) => (p.tmdb_person_id || p.id) !== tmdbPersonId),
      );
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `${API_URL}/api/people/list/${selectedList._id}/${tmdbPersonId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedList(data);
      setEditPeople(data.people || []);
      setLists((prev) => prev.map((l) => (l._id === data._id ? data : l)));
    } catch (err) {
      console.error("Error removing person:", err);
    }
  };

  const openDetail = (list) => {
    setSelectedList(list);
    setView("detail");
  };

  const goBack = () => {
    setView("lists");
    setSelectedList(null);
    setQuery("");
    setSearchResults([]);
  };

  if (view === "form") {
    return (
      <FormView
        isEdit={isEditMode}
        editName={editName}
        setEditName={setEditName}
        editNote={editNote}
        setEditNote={setEditNote}
        editPrivate={editPrivate}
        setEditPrivate={setEditPrivate}
        editRanked={editRanked}
        setEditRanked={setEditRanked}
        people={editPeople}
        query={query}
        setQuery={setQuery}
        searchResults={searchResults}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onSave={handleSave}
        onCancel={goBack}
        searchRef={searchRef}
      />
    );
  }

  if (view === "detail" && selectedList) {
    return <DetailView list={selectedList} onBack={goBack} onEdit={openForm} />;
  }

  return (
    <ListsView
      lists={lists}
      onNewList={() => openForm(null)}
      onOpenDetail={openDetail}
      onEdit={openForm}
      onDelete={handleDeleteList}
      onBack={handleBack}
    />
  );
};

export default PeoplePage;
