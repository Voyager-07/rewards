const Header = ({ username }) => {
  return (
    <header className="bg-gray-200 py-4 text-center">
      <h1 className="text-xl font-semibold text-gray-800">
        {username ? `Hello ${username}` : "Hello, Guest"}
      </h1>
    </header>
  );
};

export default Header;
