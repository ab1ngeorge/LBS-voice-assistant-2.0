-- ============================================
-- Add comprehensive website directory to knowledge_base
-- Source: Official LBSCEK website navigation
-- ============================================

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES

-- Section 3: Institution Links
('institution_links', '3. Institution - Website Directory', E'## 3. Institution - Website Directory\n- **Homepage:** https://lbscek.ac.in/\n- **About Us:** https://lbscek.ac.in/about-us/\n- **College Map:** https://lbscek.ac.in/college-map/\n- **Mandatory Disclosure:** https://lbscek.ac.in/mandatory-disclosure/\n- **AICTE Orders:** https://lbscek.ac.in/aicte-orders/\n- **NBA Accreditation Process:** https://lbscek.ac.in/nba-accreditation-process/\n- **Special Rule:** https://lbscek.ac.in/special-rule/\n- **Audit Reports:** https://lbscek.ac.in/audit-reports/\n- **Student Verification:** https://lbscek.ac.in/student-verification/\n- **Quotations and Tenders:** https://lbscek.ac.in/quotations-and-tenders/\n- **Anti Ragging Cell:** https://lbscek.ac.in/anti-ragging-cell/\n- **AICTE Online Skill Test:** https://lbscek.ac.in/aicte-online-skill-test/\n- **AICTE Feedback:** https://lbscek.ac.in/aicte-feedback/\n- **Grievance Cell:** https://lbscek.ac.in/grievance-cell/', 3),

-- Section 4: Administration
('administration', '4. Administration', E'## 4. Administration\n- **Board of Governors:** https://lbscek.ac.in/board-of-governors/\n- **Director:** https://lbscek.ac.in/director/\n- **Principal:** https://lbscek.ac.in/principal/\n- **UG Dean:** https://lbscek.ac.in/ug-dean/\n- **Dean Research & Development:** https://lbscek.ac.in/dean-research-development/\n- **Internal Compliance Committee:** https://lbscek.ac.in/internal-compliance-committee/\n- **Internal Quality Assurance Cell (IQAC):** https://lbscek.ac.in/internal-quality-assurance-cell-iqac/\n- **Administrative Wing:** https://lbscek.ac.in/administrative-wing/\n- **Right to Information:** https://lbscek.ac.in/right-to-information/', 4),

-- Section 5: Admission
('admission_info', '5. Admission', E'## 5. Admission\n- **Admission Process:** https://lbscek.ac.in/admission-procedure/\n- **Admission (KEAM):** https://lbscek.ac.in/admission-keam/\n- **NRI Scheme:** https://lbscek.ac.in/nri-scheme/\n- **Lateral Entry Scheme:** https://lbscek.ac.in/lateral-entry-scheme/\n- **Non KEAM Admission:** https://lbscek.ac.in/non-keam-admission/\n- **Fee Waiver Scheme:** https://lbscek.ac.in/fee-waiver-scheme/\n- **Fee Structure:** https://lbscek.ac.in/fee-structure/', 5),

-- Section 6: Academics
('academics', '6. Academics', E'## 6. Academics\n- **Departments (Overview):** https://lbscek.ac.in/departments/\n- **Programs (Overview):** https://lbscek.ac.in/programs/\n- **Syllabus:** https://lbscek.ac.in/syllabus/\n- **Academic Calendar:** https://lbscek.ac.in/academic-calendar/\n- **Downloads:** https://lbscek.ac.in/downloads/', 6),

-- Section 7: Departments
('departments', '7. Departments', E'## 7. Departments\n- **Computer Science & Engineering:** https://lbscek.ac.in/computer-science-engineering-2/\n- **Mechanical Engineering:** https://lbscek.ac.in/mechanical-engineering/\n- **Electrical & Electronics Engineering:** https://lbscek.ac.in/electrical-electronics-engineering/\n- **Electronics & Communication Engineering:** https://lbscek.ac.in/electronics-communication-engineering/\n- **Civil Engineering:** https://lbscek.ac.in/civil-engineering/\n- **Applied Science:** https://lbscek.ac.in/applied-science/\n- **Physical Education:** https://lbscek.ac.in/physical-education/', 7),

-- Section 8: Activities
('activities', '8. Activities & Cells', E'## 8. Activities & Cells\n- **Career Guidance & Placement Unit (CGPU):** https://lbscek.ac.in/career-guidance-placement-unit-cgpu/\n- **Alumni Association:** https://lbscek.ac.in/alumni-association/\n- **National Service Scheme (NSS):** https://lbscek.ac.in/national-service-scheme/\n- **Parent Teacher Association (PTA):** https://lbscek.ac.in/parent-teacher-association/\n- **Continuing Education Cell:** https://lbscek.ac.in/continuing-education-cell/\n- **IEDC:** https://lbscek.ac.in/iedc/\n- **Industry Institute Interaction:** https://lbscek.ac.in/industry-institute-interaction/\n- **IEEE:** https://lbscek.ac.in/ieee/\n- **College Union:** https://lbscek.ac.in/college-union/', 8),

-- Section 9: Facilities
('facilities', '9. Facilities', E'## 9. Facilities\n- **Central Library:** https://lbscek.ac.in/central-library/\n- **Digital Library:** https://lbscek.ac.in/digital-library/\n- **Central Computing Facility:** https://lbscek.ac.in/central-computing-facility/\n- **AICTE IDEA Lab:** https://lbscek.ac.in/aicte-idea-lab/\n- **Hostel:** https://lbscek.ac.in/hostel/\n- **Bus Service:** https://lbscek.ac.in/bus-service/\n- **ATM Facility:** https://lbscek.ac.in/atm-facility/\n- **Student Co-Operative Society:** https://lbscek.ac.in/student-co-operative-society/\n- **Fab Lab Facility:** https://lbscek.ac.in/fab-lab-facility/\n- **Skill Delivery Platform:** https://lbscek.ac.in/skill-delivery-platform/', 9),

-- Section 10: Fee Payment
('fee_payment', '10. Fee Payment', E'## 10. Fee Payment\n- **Annual / Admission Fee:** https://lbscek.ac.in/annual-admission-fee/\n- **Exam/Other Fee Payment:** https://lbscek.ac.in/exam-other-fee-payment/\n- **Semester Registration Online:** https://lbscek.ac.in/semester-registration-online/\n- **Hostel Rent:** https://lbscek.ac.in/hostel-rent/', 10),

-- Section 11: Contact
('contact', '11. Contact', E'## 11. Contact\n- **Contact Us:** https://lbscek.ac.in/contact-2/', 11)

ON CONFLICT (section_key) DO UPDATE
SET content = EXCLUDED.content,
    section_title = EXCLUDED.section_title,
    section_order = EXCLUDED.section_order;
