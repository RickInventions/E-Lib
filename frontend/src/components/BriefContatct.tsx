export default function BriefContact() {
  return (
    <div className="BriefContact flex bg-gray-100 p-6 rounded-lg shadow-md gap-4">

    <div className="contact p-4 w-[50%]">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <p className="text-gray-700 mb-4">
        For any inquiries, please reach out to us at:
      </p>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Email: <a href="mailto:richardabimbola121@gmail.com" className="text-blue-600 hover:underline">
            </a></li>
        <li>Phone: <a href="tel:+2349031234567" className="text-blue-600 hover:underline">+234 903 123 4567</a></li>
        <li>Address: 123 Library Lane, Booktown, BK 12345</li>
        </ul>
        <p className="text-gray-700 mt-4">
          We are here to assist you with any questions or concerns you may have.
          Feel free to reach out to us anytime!
          </p>
    </div>

    <div className="lib-hours p-4 w-[50%] ">
      <h2 className="text-2xl font-bold mb-4">Library Hours</h2>
      <div className="hours gap-40 flex mb-1">
        <p className="font-bold">Sunday</p>
        <p>12:00 PM - 6:00 PM</p>
      </div>
      <div className="hours gap-16 flex mb-1">
        <p className="font-bold">Monday - Thursday</p>
        <p>6:00 PM - 9:00 PM</p>
      </div>
      <div className="hours gap-24 flex mb-1">
        <p className="font-bold">Friday - Saturday</p>
        <p>6:00 PM - 6:00 PM</p>
      </div>
    </div>
    </div>
  );
}