gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
tion Buttons */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating...</>) : (<><Check className="w-4 h-4" />Create Employee</>)}
          </button>
          <Link href="/dashboard/management/employees" className="px-6 py-2.5 bg-        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.insurance_expiry} onChange={(e) => setFormData({...formData, insurance_expiry: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* AcsName="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.insurance_policy_number} onChange={(e) => setFormData({...formData, insurance_policy_number: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Expiry</label>
              <div className="relative">
         dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.annual_leave_entitlement} onChange={(e) => setFormData({...formData, annual_leave_entitlement: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Policy Number</label>
              <input type="text" placeholder="Enter policy number" claszinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_salary} onChange={(e) => setFormData({...formData, current_salary: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Leave Entitlement (Days)</label>
              <input type="number" placeholder="30" className="w-full px-4 py-2.5 bg-whiteer border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.starting_salary} onChange={(e) => setFormData({...formData, starting_salary: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-ed-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Salary & Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Starting Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 bordocus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary & Benefits */}
        <div className="bg-white dark:bg-zinc-900 roundfocus:ring-2 focus:ring-blue-500" value={formData.position_start_date} onChange={(e) => setFormData({...formData, position_start_date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 f       </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none ark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_branch_id} onChange={(e) => setFormData({...formData, current_branch_id: e.target.value})} disabled={branchesLoading}>
                <option value="">{branchesLoading ? 'Loading...' : 'Select Branch'}</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.label || branch.branch_name || branch.name}</option>
                ))}
       g...' : 'Select Branch'}</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.label || branch.branch_name || branch.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Branch</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dpace-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch on Visa</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.branch_on_visa_id} onChange={(e) => setFormData({...formData, branch_on_visa_id: e.target.value})} disabled={branchesLoading}>
                <option value="">{branchesLoading ? 'Loadin<Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Position on visa" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_position} onChange={(e) => setFormData({...formData, visa_position: e.target.value})} />
              </div>
            </div>

            <div className="s-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.actual_position} onChange={(e) => setFormData({...formData, actual_position: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Position</label>
              <div className="relative">
                00 dark:text-white mb-6">Employment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="e.g. Sales Manager" className="w-full pl-10 pr.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.eid_expiry} onChange={(e) => setFormData({...formData, eid_expiry: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Employment */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-92 focus:ring-blue-500" value={formData.eid_number} onChange={(e) => setFormData({...formData, eid_number: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emirates ID Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2g-2 focus:ring-blue-500" value={formData.visa_type} onChange={(e) => setFormData({...formData, visa_type: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emirates ID Number</label>
              <input type="text" placeholder="784-XXXX-XXXXXXX-X" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-ne focus:ring-2 focus:ring-blue-500" value={formData.visa_status} onChange={(e) => setFormData({...formData, visa_status: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Type</label>
              <input type="text" placeholder="e.g. Employment" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:rinocus:ring-blue-500" value={formData.visa_expiry} onChange={(e) => setFormData({...formData, visa_expiry: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Status</label>
              <input type="text" placeholder="e.g. Valid, Expired" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-noalue})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 f         </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Number</label>
              <input type="text" placeholder="Enter visa number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_number} onChange={(e) => setFormData({...formData, visa_number: e.target.v-gray-300">Passport Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.passport_expiry} onChange={(e) => setFormData({...formData, passport_expiry: e.target.value})} />
     00">Passport Number</label>
              <input type="text" placeholder="Enter passport number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.passport_number} onChange={(e) => setFormData({...formData, passport_number: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text      />
            </div>
          </div>
        </div>

        {/* Passport & Visa */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Passport & Visa Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-3-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
              <input
                type="text"
                placeholder="Name and phone number"
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
            placeholder="work@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.work_email}
                  onChange={(e) => setFormData({...formData, work_email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="textal_email}
                  onChange={(e) => setFormData({...formData, personal_email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
              y-300">Personal Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="personal@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.person             className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gra       onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+971 XX XXX XXXX"
                  </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nationality</label>
              <input
                type="text"
                placeholder="e.g. UAE"
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nationality}
         -y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
 irst_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translated-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.f8">
        {/* Personal Information */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name <span className="text-reify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Employee</h1>
          <p className="text-gray-500 text-sm">Create a new employee record</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-
      };

      await employeeService.create(payload);
      success("Employee created successfully!");
      router.push("/dashboard/management/employees");
    } catch (err) {
      error(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/management/employees" 
          className="flex items-center just  visa_expiry: formData.visa_expiry || null,
        insurance_policy_number: formData.insurance_policy_number || null,
        insurance_expiry: formData.insurance_expiry || null,
        starting_salary: formData.starting_salary ? parseFloat(formData.starting_salary) : 0,
        current_salary: formData.current_salary ? parseFloat(formData.current_salary) : 0,
        annual_leave_entitlement: formData.annual_leave_entitlement ? parseInt(formData.annual_leave_entitlement) : 30,
        status: formData.statusposition: formData.visa_position || null,
        visa_type: formData.visa_type || null,
        branch_on_visa_id: formData.branch_on_visa_id ? parseInt(formData.branch_on_visa_id) : null,
        current_branch_id: formData.current_branch_id ? parseInt(formData.current_branch_id) : null,
        position_start_date: formData.position_start_date || null,
        eid_number: formData.eid_number || null,
        eid_expiry: formData.eid_expiry || null,
        visa_number: formData.visa_number || null,
           nationality: formData.nationality || null,
        mobile_number: formData.mobile_number || null,
        emergency_contact: formData.emergency_contact || null,
        personal_email: formData.personal_email || null,
        work_email: formData.work_email || null,
        passport_number: formData.passport_number || null,
        passport_expiry: formData.passport_expiry || null,
        visa_status: formData.visa_status || null,
        actual_position: formData.actual_position || null,
        visa_   setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name) {
      error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
   _id: "",
    position_start_date: new Date().toISOString().split('T')[0],
    eid_number: "",
    eid_expiry: "",
    visa_number: "",
    visa_expiry: "",
    insurance_policy_number: "",
    insurance_expiry: "",
    starting_salary: "",
    current_salary: "",
    annual_leave_entitlement: "30",
    status: "active"
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const data = await branchService.getDropdown();
   ing] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    mobile_number: "",
    emergency_contact: "",
    personal_email: "",
    work_email: "",
    passport_number: "",
    passport_expiry: "",
    visa_status: "",
    actual_position: "",
    visa_position: "",
    visa_type: "",
    branch_on_visa_id: "",
    current_branchreact";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, Calendar, Briefcase, 
  ArrowLeft, Check, Loader2
} from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function AddEmployeePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoad"use client";

