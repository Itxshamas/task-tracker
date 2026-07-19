function getInitials(name = "") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ src, name, className = "h-10 w-10", ...props }) {
  const base = `${className} inline-flex items-center justify-center rounded-full text-sm font-semibold`;

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={`${className} rounded-full object-cover`}
        {...props}
      />
    );
  }

  return (
    <div className={`${base} bg-slate-200 text-slate-700`} {...props}>
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
