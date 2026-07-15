# شرح واجهات المستخدم الشخصي في Work Bridge

هذا الملف مخصص للمناقشة. الفكرة منه أن تفهمي كل واجهة تخص المستخدم الشخصي `personal`: ما وظيفتها، ما أهم الكود فيها، وما الذي تقولينه عنها بشكل عام.

## الفكرة العامة

المشروع مبني بـ React + TypeScript + Vite. واجهات المستخدم الشخصي موجودة داخل:

`src/app/pages/user`

أما ملفات الاتصال مع الباك إند الخاصة بهذه الواجهات فهي داخل:

`src/app/api/pages/user`

كل واجهة غالبا تعمل بهذه الطريقة:

1. تعرض الصفحة داخل `DashboardLayout`.
2. تستخدم `useLanguage` لتبديل النصوص بين عربي وإنكليزي.
3. تستخدم `useState` لحفظ البيانات والحالات مثل loading و error.
4. تستخدم `useEffect` أو `useCallback` لجلب البيانات من API.
5. تستدعي دوال API من مجلد `api/pages/user`.
6. تعرض رسائل نجاح أو خطأ حسب نتيجة الطلب.

## ملفات أساسية قبل الواجهات

### `DashboardLayout.tsx` = قالب لوحة التحكم

المسار:

`src/app/components/layout/DashboardLayout.tsx`

هذا الملف مسؤول عن شكل لوحة التحكم العام: السايدبار، الهيدر، زر اللغة، الإشعارات، الرسائل، واسم الحساب.

أهم ما فيه:

- يحدد قائمة صفحات المستخدم مثل Dashboard و Projects و Contracts و Wallet.
- يجلب عدد الإشعارات غير المقروءة عن طريق `getUnreadNotificationCount`.
- يجلب عدد الرسائل غير المقروءة عن طريق `getConversations`.
- يحدد الرابط الصحيح حسب نوع الحساب: user أو company أو admin.
- يحتوي زر تسجيل الخروج من خلال `logout`.

ماذا تقولين بالمناقشة:

هذه الواجهة ليست صفحة محتوى، بل هي Layout مشترك. كل صفحات المستخدم تظهر بداخلها حتى يكون التنقل موحدا.

### `userRoutes.ts` = مسارات المستخدم

المسار:

`src/app/route-config/userRoutes.ts`

هذا الملف يربط كل URL بواجهة المستخدم المناسبة.

أمثلة:

- `/dashboard` يفتح `Dashboard`.
- `/projects` يفتح `Projects`.
- `/wallet` يفتح `Wallet`.
- `/profile` يفتح `Profile`.

ماذا تقولين بالمناقشة:

هذا الملف هو خريطة صفحات المستخدم. أي صفحة مستخدم لازم تكون معرفة هون حتى يستطيع React Router الوصول لها.

### `ProtectedRoute.tsx` = حماية الصفحات

المسار:

`src/app/route-config/ProtectedRoute.tsx`

هذا الملف يمنع المستخدم غير المصرح له من دخول الصفحات.

أهم الحالات:

- إذا لا يوجد token يحوله إلى `/login`.
- إذا الإيميل غير مؤكد يحوله إلى `/verify-email`.
- إذا الحساب pending أو blocked أو under_review يحوله إلى صفحة حالة الحساب.
- إذا الدور ليس `personal` يمنعه من دخول صفحات المستخدم.

ماذا تقولين بالمناقشة:

هذا الملف يطبق الحماية على مستوى الواجهة، بحيث لا يستطيع مستخدم شركة أو أدمن الدخول إلى صفحات المستخدم الشخصي.

### `AuthProvider.tsx` = إدارة جلسة المستخدم

المسار:

`src/app/providers/AuthProvider.tsx`

هذا الملف يدير تسجيل الدخول والخروج وحفظ المستخدم.

أهم ما فيه:

- `login`: تسجيل الدخول.
- `register`: إنشاء حساب.
- `logout`: تسجيل الخروج.
- `refreshUser`: تحديث بيانات المستخدم من `/me`.
- `getDashboardPath`: يحدد لوحة التحكم حسب الدور.
- `getAccountStatusPath`: يحدد هل الحساب محظور أو تحت المراجعة.

ماذا تقولين بالمناقشة:

هذا الملف هو مركز إدارة المصادقة. منه نعرف هل المستخدم مسجل، ما دوره، وهل حسابه فعال أم لا.

### `client.ts` = عميل الاتصال مع API

المسار:

`src/app/api/client.ts`

هذا الملف مسؤول عن إرسال الطلبات للباك إند.

أهم ما فيه:

- يقرأ `VITE_API_URL` أو يستخدم `http://127.0.0.1:8000/api`.
- يضيف `Authorization: Bearer token` إذا كان المستخدم مسجلا.
- يحول body إلى JSON إلا إذا كان `FormData`.
- يتعامل مع أخطاء 401 و403 و404 و500.

ماذا تقولين بالمناقشة:

أي واجهة تحتاج بيانات من الباك إند لا تتعامل مع `fetch` مباشرة، بل تستخدم `apiRequest` من هذا الملف لتوحيد طريقة الطلبات والأخطاء.

## 1. واجهة لوحة التحكم

### `Dashboard.tsx` = Dashboard / لوحة التحكم

المسار:

`src/app/pages/user/Dashboard.tsx`

وظيفتها:

تعرض ملخص حساب المستخدم: عدد المشاريع، الخدمات، التقديمات، المحفظة، العقود، آخر النشاطات، وآخر المشاريع.

ملف API:

`src/app/api/pages/user/dashboard.ts`

الدالة المستخدمة:

`getPersonalDashboard()`

ترسل طلبا إلى:

`GET /dashboard/personal`

أهم الكود:

- `useState` لحفظ بيانات الداشبورد، حالة التحميل، ورسالة الخطأ.
- `useRef` باسم `requestIdRef` لمنع عرض نتيجة طلب قديم إذا صار طلب أحدث.
- `loadDashboard` تجلب بيانات المستخدم من API.
- `formatNumber` لتنسيق الأرقام.
- `formatDate` لتنسيق التاريخ.
- `statusLabel` لترجمة حالة المشروع أو العقد.
- `activityTypeLabel` لترجمة نوع النشاط.
- `StatCard` مكون صغير لإظهار رقم وإحصائية.

ماذا تقولين بالمناقشة:

لوحة التحكم هي صفحة تجميع. لا تنشئ بيانات جديدة، بل تعرض حالة المستخدم بشكل مختصر من خلال API واحد يرجع الإحصائيات، آخر النشاطات، العقود الفعالة، وآخر المشاريع.

## 2. واجهة الملف الشخصي

### `Profile.tsx` = Profile / الملف الشخصي

المسار:

`src/app/pages/user/Profile.tsx`

وظيفتها:

عرض بيانات المستخدم الشخصية والمهنية مثل الاسم، المسمى الوظيفي، المهارات، النبذة، التقييمات، وعدد المراجعات.

ملف API:

`src/app/api/pages/user/profile.ts`

الدوال المستخدمة:

- `getProfile()`
- `updateProfile(payload)`

الطلبات:

- `GET /profile`
- `PUT /profile`

أهم الكود:

- يجلب البروفايل من الباك إند.
- يعرض المهارات والتقييمات.
- يستخدم نوع البيانات `PersonalProfile`.
- يعتمد على `PersonalProfileResponse` الذي يحتوي profile و rating_avg و reviews_count.

ماذا تقولين بالمناقشة:

هذه الواجهة تمثل الهوية المهنية للمستخدم داخل المنصة. منها تظهر خبرته ومهاراته وتقييمه لباقي المستخدمين.

## 3. واجهة المشاريع

### `Projects.tsx` = Projects / المشاريع

المسار:

`src/app/pages/user/Projects.tsx`

وظيفتها:

تصفح المشاريع المتاحة، البحث والتصفية، عرض مشاريعي، إدارة حالة المشروع، وحذف أو الإبلاغ عن مشروع.

ملف API:

`src/app/api/pages/user/projects.ts`

الدوال المستخدمة:

- `getProjects(params)`
- `getMyProjects(page)`
- `getCategories()`
- `updateProjectStatus(id, status)`
- `deleteProject(id)`
- `createReport(payload)`

الطلبات المهمة:

- `GET /projects`
- `GET /projects/mine`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `POST /reports`

أهم الكود:

- يخزن قائمة المشاريع في state.
- يستخدم فلاتر مثل البحث، التصنيف، الحالة، الموقع، السعر.
- يميز بين كل المشاريع ومشاريع المستخدم.
- عند تغيير حالة المشروع يستدعي `updateProjectStatus`.
- عند البلاغ يستخدم `createReport`.

ماذا تقولين بالمناقشة:

هذه الواجهة هي سوق المشاريع. المستخدم يرى المشاريع المنشورة، ويستطيع إدارة مشاريعه الخاصة، كما يستطيع الإبلاغ عن محتوى غير مناسب.

## 4. واجهة إنشاء مشروع

### `CreateProject.tsx` = Create Project / إنشاء مشروع

المسار:

`src/app/pages/user/CreateProject.tsx`

وظيفتها:

إضافة مشروع جديد من قبل المستخدم.

ملف API:

`src/app/api/pages/user/createProject.ts`

الدوال المستخدمة:

- `createProject(payload)`
- `getCategories()`
- `getGovernorates()`
- `getCitiesByGovernorate(governorateId)`

الطلبات:

- `POST /projects`
- `GET /categories`
- `GET /governorates`
- `GET /governorates/:id/cities`

أهم الكود:

- `formData` يحفظ قيم النموذج مثل العنوان، الوصف، الميزانية، المدة، التصنيف، المحافظة، المدينة، المهارات.
- أول `useEffect` يجلب التصنيفات والمحافظات.
- ثاني `useEffect` يجلب المدن حسب المحافظة المختارة.
- `handleChange` يحدث قيم النموذج.
- `handleSubmit` يرسل المشروع للباك إند.
- `getValidationErrors` يعرض أخطاء الحقول.

ماذا تقولين بالمناقشة:

هذه الصفحة تحول إدخال المستخدم إلى payload وترسله للباك إند لإنشاء مشروع. كما أنها تعتمد على بيانات مساعدة مثل التصنيفات والمدن.

## 5. واجهة تفاصيل المشروع

### `ProjectDetails.tsx` = Project Details / تفاصيل المشروع

المسار:

`src/app/pages/user/ProjectDetails.tsx`

وظيفتها:

عرض تفاصيل مشروع واحد، والتقديم عليه بعرض، أو بدء محادثة مع صاحب المشروع.

ملف API:

`src/app/api/pages/user/projectDetails.ts`

الدوال المستخدمة:

- `getProject(id)`
- `applyToProject(projectId, payload)`
- `startConversation(userId)`

الطلبات:

- `GET /projects/:id`
- `POST /projects/:id/applications`
- `POST /conversations/start`

أهم الكود:

- يقرأ `id` من الرابط.
- يجلب بيانات المشروع.
- يحتوي نموذج تقديم عرض: السعر، مدة التنفيذ، الوصف.
- عند الإرسال يستخدم `applyToProject`.
- عند المراسلة يستخدم `startConversation`.

ماذا تقولين بالمناقشة:

هذه الواجهة هي نقطة دخول المستخدم للتعامل مع مشروع محدد. إما يقرأ التفاصيل فقط، أو يقدم عرضا، أو يتواصل مع صاحب المشروع.

## 6. واجهة التقديمات

### `Applications.tsx` = Applications / التقديمات والعروض

المسار:

`src/app/pages/user/Applications.tsx`

وظيفتها:

تعرض عروض المشاريع وطلبات الخدمات المرتبطة بالمستخدم.

ملف API:

`src/app/api/pages/user/applications.ts`

الدوال المستخدمة:

- `getMyProjectApplications(page)`
- `getReceivedProjectApplications(page)`
- `getMyServiceRequests()`
- `acceptProjectApplication(id)`
- `rejectProjectApplication(id)`

الطلبات:

- `GET /applications/my`
- `GET /applications/received`
- `GET /service-requests/my`
- `POST /applications/:id/accept`
- `POST /applications/:id/reject`

أهم الكود:

- يجلب ثلاث قوائم مرة واحدة باستخدام `Promise.all`.
- يخزن العروض المرسلة والعروض الواردة وطلبات الخدمات.
- `handleProjectDecision` تقبل أو ترفض عرضا.
- `statusLabel` و `statusClasses` لترجمة وتلوين الحالة.
- `ProjectApplicationCard` يعرض بطاقة العرض.

ماذا تقولين بالمناقشة:

هذه الواجهة تجمع التفاعلات التي تحتاج قرارا أو متابعة: عروض أرسلها المستخدم، عروض وصلت لمشاريعه، وطلبات خدماته.

## 7. واجهة الوظائف

### `Jobs.tsx` = Jobs / الوظائف

المسار:

`src/app/pages/user/Jobs.tsx`

وظيفتها:

عرض وظائف الشركات والسماح للمستخدم الشخصي بالتقديم عليها.

ملف API:

`src/app/api/pages/user/jobs.ts`

الدوال المستخدمة:

- `getJobs()`
- `applyToJob(jobId)`
- `getMyJobApplications()`
- `createReport(payload)`

الطلبات:

- `GET /jobs`
- `POST /jobs/:id/apply`
- `GET /my-job-applications`
- `POST /reports`

أهم الكود:

- يجلب الوظائف والتقديمات السابقة معا.
- `appliedIds` يحفظ الوظائف التي قدم عليها المستخدم حتى لا يقدم مرتين.
- يوجد بحث وتقسيم صفحات pagination.
- `submitApplication` يرسل طلب التقديم.
- `reportJob` يرسل بلاغ عن وظيفة.

ماذا تقولين بالمناقشة:

هذه الواجهة تربط المستخدم الشخصي مع الشركات. المستخدم يستطيع البحث عن وظيفة، التقديم عليها، ومعرفة إذا كان قد قدم مسبقا.

## 8. واجهة الوظائف التي قدم عليها

### `AppliedJobs.tsx` = Applied Jobs / الوظائف التي قدمت عليها

المسار:

`src/app/pages/user/AppliedJobs.tsx`

وظيفتها:

عرض سجل الوظائف التي قدم عليها المستخدم وحالة كل طلب.

ملفات مرتبطة:

- `src/app/components/job-applications/JobApplicationsList.tsx`
- `src/app/api/pages/user/jobApplicationsList.ts`

الدالة المستخدمة:

`getMyJobApplications()`

الطلب:

`GET /my-job-applications`

أهم الكود:

- الصفحة نفسها بسيطة وتعتمد على مكون `JobApplicationsList`.
- المكون يجلب البيانات ويعرض الشركة، الوظيفة، والحالة.

ماذا تقولين بالمناقشة:

بدل تكرار كود عرض طلبات الوظائف، الصفحة تستخدم مكونا مشتركا اسمه `JobApplicationsList`.

## 9. واجهة الخدمات

### `Services.tsx` = Services / الخدمات

المسار:

`src/app/pages/user/Services.tsx`

وظيفتها:

تصفح الخدمات التي يعرضها المستخدمون، البحث عنها، طلب خدمة، مراسلة صاحب الخدمة، أو الإبلاغ عنها.

ملف API:

`src/app/api/pages/user/services.ts`

الدوال المستخدمة:

- `getServices()`
- `startConversation(userId)`
- `createReport(payload)`

الطلبات:

- `GET /services`
- `POST /conversations/start`
- `POST /reports`

أهم الكود:

- يجلب كل الخدمات.
- يستخدم بحث أو تصفية.
- يوجه المستخدم إلى صفحة طلب الخدمة عند الضغط على الطلب.
- يبدأ محادثة مع صاحب الخدمة.
- يسمح بإنشاء بلاغ.

ماذا تقولين بالمناقشة:

هذه الواجهة هي سوق الخدمات. المستخدم يرى الخدمات الجاهزة ويستطيع طلبها أو التواصل مع صاحبها.

## 10. واجهة إنشاء خدمة

### `CreateService.tsx` = Create Service / إنشاء خدمة

المسار:

`src/app/pages/user/CreateService.tsx`

وظيفتها:

تمكن المستخدم من إضافة خدمة يقدمها للآخرين.

ملف API:

`src/app/api/pages/user/createService.ts`

الدوال المستخدمة:

- `getCategories()`
- `createService(payload)`

الطلبات:

- `GET /categories`
- `POST /services`

أهم الكود:

- `formData` يحفظ عنوان الخدمة، التصنيف، السعر، مدة التسليم، والوصف.
- `useEffect` يجلب التصنيفات.
- `handleSubmit` يتحقق ويرسل البيانات.
- `fieldErrors` يعرض أخطاء التحقق القادمة من Laravel.

ماذا تقولين بالمناقشة:

هذه الصفحة تنشئ خدمة جديدة وتربطها بحساب المستخدم، لذلك المستخدم هنا يصبح مقدم خدمة وليس فقط طالب خدمة.

## 11. واجهة خدماتي

### `MyServices.tsx` = My Services / خدماتي

المسار:

`src/app/pages/user/MyServices.tsx`

وظيفتها:

عرض الخدمات الخاصة بالمستخدم وتعديلها أو حذفها أو تغيير حالتها.

ملف API:

`src/app/api/pages/user/myServices.ts`

الدوال المستخدمة:

- `getServices()`
- `getCategories()`
- `updateService(id, payload)`
- `deleteService(id)`

الطلبات:

- `GET /services`
- `GET /categories`
- `PUT /services/:id`
- `DELETE /services/:id`

أهم الكود:

- يجلب خدمات المستخدم.
- يسمح بتعديل بيانات الخدمة.
- يسمح بتغيير الحالة مثل active أو paused.
- يستخدم Dialog أو form للتعديل.

ماذا تقولين بالمناقشة:

هذه الواجهة هي إدارة الخدمات التي يملكها المستخدم، وليست تصفح كل خدمات المنصة.

## 12. واجهة طلب خدمة

### `RequestService.tsx` = Request Service / طلب خدمة

المسار:

`src/app/pages/user/RequestService.tsx`

وظيفتها:

إرسال طلب على خدمة معينة.

ملف API:

`src/app/api/pages/user/requestService.ts`

الدوال المستخدمة:

- `getService(id)`
- `requestService(serviceId, payload)`
- `getMyServiceRequests()`

الطلبات:

- `GET /services/:id`
- `POST /services/:id/requests`
- `GET /service-requests/my`

أهم الكود:

- يقرأ رقم الخدمة من الرابط.
- يجلب تفاصيل الخدمة.
- يحتوي نموذج طلب: عنوان، وصف، مراجع، مدة تسليم.
- يرسل الطلب إلى صاحب الخدمة.

ماذا تقولين بالمناقشة:

هذه الواجهة تحول الخدمة المعروضة إلى طلب فعلي من مستخدم آخر، وتخزن الطلب بحالة انتظار.

## 13. واجهة طلبات الخدمات

### `ServiceRequests.tsx` = Service Requests / طلبات الخدمات

المسار:

`src/app/pages/user/ServiceRequests.tsx`

وظيفتها:

عرض طلبات الخدمات المرسلة والواردة، وقبول أو رفض الطلبات الواردة.

ملف API:

`src/app/api/pages/user/serviceRequests.ts`

الدوال المستخدمة:

- `getMyServiceRequests()`
- `getReceivedServiceRequests()`
- `acceptServiceRequest(id)`
- `rejectServiceRequest(id)`
- `startConversation(userId)`

الطلبات:

- `GET /service-requests/my`
- `GET /service-requests/received`
- `POST /service-requests/:id/accept`
- `POST /service-requests/:id/reject`
- `POST /conversations/start`

أهم الكود:

- يقسم الطلبات إلى مرسلة وواردة.
- يعرض الحالة pending أو accepted أو rejected.
- عند القبول قد ينتقل الطلب إلى عقد.
- يسمح بمراسلة الطرف الآخر.

ماذا تقولين بالمناقشة:

هذه الواجهة تدير دورة طلب الخدمة: طلب ينتظر، ثم قبول أو رفض، وبعد القبول يمكن أن يصبح تعاملا رسميا.

## 14. واجهة العقود

### `Contracts.tsx` = Contracts / العقود

المسار:

`src/app/pages/user/Contracts.tsx`

وظيفتها:

عرض وإدارة العقود بين المستخدم والطرف الآخر.

ملف API:

`src/app/api/pages/user/contracts.ts`

الدوال المستخدمة:

- `getContracts()`
- `startContract(id)`
- `completeContract(id)`
- `cancelContract(id)`
- `createContractIssue(contractId, payload)`
- `startConversation(userId)`

الطلبات:

- `GET /contracts`
- `POST /contracts/:id/start`
- `POST /contracts/:id/complete`
- `POST /contracts/:id/cancel`
- `POST /reports`
- `POST /conversations/start`

أهم الكود:

- `contracts` يحفظ قائمة العقود.
- `runAction` ينفذ بدء أو إكمال أو إلغاء العقد.
- يفحص إذا كان الخطأ بسبب رصيد غير كاف ويعرض خيار شحن المحفظة.
- `messageOtherParty` يفتح محادثة مع الطرف الآخر.
- `ContractIssueForm` يستخدم لفتح نزاع أو شكوى على العقد.
- `ContractReviewPanel` يستخدم للتقييم بعد انتهاء العقد.

ماذا تقولين بالمناقشة:

العقد هو المرحلة الرسمية في النظام. بعد قبول عرض أو طلب، يصبح هناك عقد له مبلغ وحالة، ويمكن بدءه أو إكماله أو فتح نزاع عليه.

## 15. واجهة تقييم العقد

### `contractReview.ts` و `ContractReviewPanel.tsx`

المسارات:

`src/app/api/pages/user/contractReview.ts`

`src/app/components/contracts/ContractReviewPanel.tsx`

وظيفتها:

إدارة تقييم الطرف الآخر بعد انتهاء العقد.

الدوال المستخدمة:

- `getContract(id)`
- `createReview(payload)`
- `updateReview(id, payload)`
- `deleteReview(id)`
- `getUserReviews(userId)`

الطلبات:

- `GET /contracts/:id`
- `POST /reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`
- `GET /users/:id/reviews`

أهم الكود:

- يعرض إذا كان المستخدم يستطيع التقييم.
- يسمح بإضافة تقييم نجوم وتعليق.
- يسمح بتعديل أو حذف التقييم.

ماذا تقولين بالمناقشة:

التقييم مرتبط بالعقود المكتملة حتى تكون المراجعات مبنية على تعامل حقيقي.

## 16. واجهة المحفظة

### `Wallet.tsx` = Wallet / المحفظة

المسار:

`src/app/pages/user/Wallet.tsx`

وظيفتها:

عرض رصيد المستخدم، المعاملات المالية، وطلبات الشحن والسحب.

ملف API:

`src/app/api/pages/user/wallet.ts`

الدوال المستخدمة:

- `getMyWallet()`
- `getMyWalletRequests(page)`

الطلبات:

- `GET /wallet`
- `GET /wallet/requests`

أهم الكود:

- يجلب المحفظة وطلبات المحفظة باستخدام `Promise.all`.
- يعرض balance.
- يرتب transactions حسب التاريخ.
- يترجم نوع العملية وحالتها.
- يعرض أزرار شحن وسحب.

ماذا تقولين بالمناقشة:

المحفظة هي مركز العمليات المالية للمستخدم، ومنها يعرف رصيده وسجل معاملاته وطلبات الإيداع والسحب.

## 17. واجهة شحن المحفظة

### `TopUpWallet.tsx` = Top Up Wallet / شحن المحفظة

المسار:

`src/app/pages/user/TopUpWallet.tsx`

وظيفتها:

إرسال طلب إيداع للمحفظة.

ملف API:

`src/app/api/pages/user/topUpWallet.ts`

الدالة المستخدمة:

`requestWalletDeposit(amount, payment_note, deposit_receipt, deposit_proof)`

الطلب:

`POST /wallet/deposit-requests`

أهم الكود:

- يحفظ المبلغ وطريقة الدفع والملاحظة وملف الوصل.
- يستخدم `sanitizeMoneyInput` و `parsePositiveMoney` للتأكد من صحة المبلغ.
- يرسل البيانات باستخدام `FormData` لأن الطلب قد يحتوي ملف.
- بعد النجاح يرجع المستخدم إلى المحفظة.

ماذا تقولين بالمناقشة:

الشحن ليس فوريا، بل يتم إنشاء طلب إيداع يراجعه الأدمن، لذلك الصفحة ترسل مبلغ وإثبات دفع.

## 18. واجهة سحب المحفظة

### `WithdrawWallet.tsx` = Withdraw Wallet / سحب من المحفظة

المسار:

`src/app/pages/user/WithdrawWallet.tsx`

وظيفتها:

إرسال طلب سحب من رصيد المستخدم.

ملف API:

`src/app/api/pages/user/withdrawWallet.ts`

الدوال المستخدمة:

- `getMyWallet()`
- `requestWalletWithdraw(amount, withdrawal_details)`

الطلبات:

- `GET /wallet`
- `POST /wallet/withdraw-requests`

أهم الكود:

- يجلب الرصيد أولا حتى يعرف الحد المتاح للسحب.
- يتحقق أن المبلغ رقم موجب.
- يبني تفاصيل السحب من طريقة الدفع المختارة.
- يرسل طلب السحب للباك إند.

ماذا تقولين بالمناقشة:

السحب أيضا يتم كطلب ينتظر موافقة الإدارة، ولا يتم خصم أو تحويل مباشر من الواجهة.

## 19. واجهة الرسائل

### `Messages.tsx` = Messages / الرسائل

المسار:

`src/app/pages/user/Messages.tsx`

وظيفتها:

إدارة محادثات المستخدم وإرسال الرسائل.

ملف API:

`src/app/api/pages/user/messages.ts`

الدوال المستخدمة:

- `getConversations()`
- `getConversationMessagesPage(conversationId, page)`
- `sendConversationMessage(conversationId, content)`
- `markConversationAsRead(conversationId)`

الطلبات:

- `GET /conversations`
- `GET /conversations/:id/messages?page=`
- `POST /conversations/:id/messages`
- `POST /conversations/:id/read`

أهم الكود:

- يخزن المحادثات والرسائل والمحادثة المختارة.
- يستخدم `searchParams` لاختيار محادثة من الرابط.
- `mergeMessages` يدمج الرسائل بدون تكرار.
- `getOtherUser` يحدد الطرف الآخر.
- يدعم تحميل رسائل أقدم pagination.
- بعد إرسال رسالة يحدث القائمة.

ماذا تقولين بالمناقشة:

هذه الواجهة مسؤولة عن التواصل داخل النظام. وهي تفصل بين قائمة المحادثات ومحتوى المحادثة المختارة.

## 20. واجهة الإشعارات

### `Notifications.tsx` = Notifications / الإشعارات

المسار:

`src/app/pages/user/Notifications.tsx`

وظيفتها:

عرض إشعارات المستخدم وتعليمها كمقروءة أو حذفها.

ملف API:

`src/app/api/pages/user/notifications.ts`

الدوال المستخدمة:

- `getNotifications(page)`
- `getUnreadNotificationCount()`
- `markNotificationAsRead(id)`
- `markAllNotificationsAsRead()`
- `deleteNotification(id)`

الطلبات:

- `GET /notifications`
- `GET /notifications/unread-count`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `DELETE /notifications/:id`

أهم الكود:

- يجلب الإشعارات بشكل paginated.
- يميز بين المقروء وغير المقروء عن طريق `read_at`.
- يسمح بتعليم إشعار واحد أو كل الإشعارات كمقروءة.
- يرسل event لتحديث عداد الإشعارات في `DashboardLayout`.

ماذا تقولين بالمناقشة:

الإشعارات تعطي المستخدم تنبيهات عن الأحداث المهمة، والعداد في الهيدر يتحدث بناء على عدد غير المقروء.

## 21. واجهة الإعدادات

### `Settings.tsx` = Settings / الإعدادات

المسار:

`src/app/pages/user/Settings.tsx`

وظيفتها:

إدارة إعدادات الحساب: الملف الشخصي، الخصوصية، الإشعارات، كلمة المرور، وحذف بيانات محلية.

ملف API:

`src/app/api/pages/user/settings.ts`

الدوال المستخدمة للمستخدم:

- `getUserSettings()`
- `updatePrivacySettings(payload)`
- `updateNotificationSettings(payload)`
- `updatePassword(payload)`
- `getProfile()`
- `updateProfile(payload)`
- `clearSettingsLocalData()`

الطلبات:

- `GET /settings`
- `PUT /settings/privacy`
- `PUT /settings/notifications`
- `PUT /settings/password`
- `GET /profile`
- `PUT /profile`
- `DELETE /settings/local-data`

أهم الكود:

- `profileDraft` يحفظ نسخة قابلة للتعديل من البروفايل.
- `settings` يحفظ إعدادات الخصوصية والإشعارات.
- `passwordDraft` يحفظ حقول تغيير كلمة المرور.
- `loadSettings` يجلب الإعدادات والبروفايل.
- `saveProfile` يحفظ بيانات الملف الشخصي.
- `savePassword` يغير كلمة المرور.
- `savePrivacy` يحفظ الخصوصية.
- `saveNotifications` يحفظ الإشعارات.
- `clearBackendData` يحذف البيانات المحلية بعد تأكيد.

ماذا تقولين بالمناقشة:

هذه الواجهة تجمع إعدادات الحساب في مكان واحد، وتفصل كل قسم بدالة حفظ خاصة به حتى لا يتم إرسال كل البيانات مرة واحدة.

## 22. واجهة مركز الدعم

### `SupportCenter.tsx` = Support Center / مركز الدعم

المسار:

`src/app/pages/user/SupportCenter.tsx`

وظيفتها:

إرسال بلاغات أو شكاوى أو نزاعات ومتابعة حالتها.

ملف API:

`src/app/api/pages/user/supportCenter.ts`

الدوال المستخدمة:

- `createReport(payload)`
- `getMyReports(page)`

الطلبات:

- `POST /reports`
- `GET /reports/my`

أهم الكود:

- يعرض قائمة البلاغات السابقة.
- يحتوي نموذج لإنشاء بلاغ جديد.
- يدعم مرفقات Files.
- يستخدم `FormData` عند وجود ملفات.
- يترجم category و priority و status.
- يعرض قرار الأدمن إذا كان موجودا.

ماذا تقولين بالمناقشة:

مركز الدعم هو قناة التواصل الرسمية مع الإدارة، ويغطي الدعم العام والشكاوى والنزاعات والدفع والمشاكل التقنية.

## 23. واجهة البروفايل العام

### `publicProfile.ts` = Public Profile API / البروفايل العام

المسار:

`src/app/api/pages/user/publicProfile.ts`

وظيفته:

جلب بروفايل مستخدم بشكل عام حتى يراه الآخرون.

الدوال المستخدمة:

- `getPublicProfile(userId)`
- `getUserReviews(userId)`
- `getProfile()`

الطلبات:

- `GET /profile`
- `GET /public/profile/:id` أو ما يعادله حسب الباك إند
- `GET /users/:id/reviews`

ماذا تقولين بالمناقشة:

البروفايل العام مختلف عن صفحة تعديل البروفايل. هو مخصص للعرض للآخرين وليس لإدارة البيانات.

## ملخص سريع حسب نوع الكود

### أكواد الجلب

تستخدم عادة داخل `useEffect`:

- `getPersonalDashboard`
- `getProfile`
- `getProjects`
- `getServices`
- `getJobs`
- `getContracts`
- `getMyWallet`
- `getNotifications`

وظيفتها:

تطلب بيانات من الباك إند وتخزنها في state حتى تظهر في الواجهة.

### أكواد الإرسال

تستخدم غالبا عند submit:

- `createProject`
- `createService`
- `applyToProject`
- `applyToJob`
- `requestService`
- `requestWalletDeposit`
- `requestWalletWithdraw`
- `createReport`

وظيفتها:

تأخذ بيانات من النموذج وترسلها للباك إند.

### أكواد القرارات

تستخدم عند الضغط على زر قبول أو رفض أو تنفيذ:

- `acceptProjectApplication`
- `rejectProjectApplication`
- `acceptServiceRequest`
- `rejectServiceRequest`
- `startContract`
- `completeContract`
- `cancelContract`

وظيفتها:

تغير حالة عنصر موجود مسبقا.

### أكواد المساعدة

أمثلة:

- `formatDate`
- `formatNumber`
- `statusLabel`
- `statusClasses`
- `categoryDisplayName`
- `formatUsd`
- `getApiErrorMessage`
- `getValidationErrors`

وظيفتها:

تحسن عرض البيانات أو تعرض الأخطاء بطريقة مفهومة.

## الجملة الذهبية للمناقشة

واجهات المستخدم الشخصي مبنية على مبدأ واضح: كل صفحة تعرض جزءا من رحلة المستخدم داخل المنصة، وكل صفحة لها ملف API خاص يفصل منطق الاتصال بالباك إند عن منطق العرض. الواجهات تستخدم React state لإدارة البيانات، و useEffect لجلبها، و DashboardLayout لتوحيد شكل لوحة التحكم، و ProtectedRoute لضمان أن المستخدم الشخصي فقط يستطيع الوصول لهذه الصفحات.

