import PropTypes from "prop-types";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mb-4 text-2xl font-bold text-gray-900">{title}</h3>

      <p className="leading-7 text-gray-600">{description}</p>
    </div>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default FeatureCard;
