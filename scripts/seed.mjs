import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const url=process.env.DATABASE_URL;
if(!url){console.error("DATABASE_URL is missing");process.exit(1);}
const sql=neon(url);

function hashPassword(password){
  const salt=crypto.randomBytes(16);
  const derived=crypto.scryptSync(password,salt,64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

const adminEmail=process.env.SEED_ADMIN_EMAIL||"admin@example.com";
const adminPassword=process.env.SEED_ADMIN_PASSWORD||"change-me";
const studentEmail=process.env.SEED_STUDENT_EMAIL||"student@example.com";
const studentPassword=process.env.SEED_STUDENT_PASSWORD||"change-me";

const [admin]=await sql`
  INSERT INTO users(name,email,password_hash,role,exp,gold,diamonds,dame,level)
  VALUES(${"Quản trị viên"},${adminEmail.toLowerCase()},${hashPassword(adminPassword)},'admin',0,0,0,0,1)
  ON CONFLICT(email) DO UPDATE SET role='admin',updated_at=NOW()
  RETURNING id
`;
const [student]=await sql`
  INSERT INTO users(name,email,password_hash,role,exp,gold,diamonds,dame,level)
  VALUES(${"Học viên Demo"},${studentEmail.toLowerCase()},${hashPassword(studentPassword)},'student',81,35,0,76,1)
  ON CONFLICT(email) DO UPDATE SET name='Học viên Demo',updated_at=NOW()
  RETURNING id
`;

const [cls]=await sql`
  INSERT INTO classes(code,name) VALUES('LUX2K9','HOÁ 12 TTV')
  ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name
  RETURNING id
`;
await sql`
  INSERT INTO class_members(class_id,user_id) VALUES(${cls.id},${student.id})
  ON CONFLICT DO NOTHING
`;

const questions=[
  {
    type:"single",chapter:"c12-1",difficulty:"high_application",title:"Ester phù hợp",
    prompt:"Chất nào dưới đây là ester?",
    options:[{id:"A",label:"A",text:"CH3COONa"},{id:"B",label:"B",text:"CH3COOC2H5"},{id:"C",label:"C",text:"C2H5OH"},{id:"D",label:"D",text:"CH3COOH"}],
    correct_options:["B"], explanation:"Ester có nhóm chức dạng R–COO–R'. CH3COOC2H5 là ethyl acetate."
  },
  {
    type:"true_false",chapter:"c12-1",difficulty:"high_application",title:"Triglyceride",
    prompt:"Xét các phát biểu sau về triglyceride:",
    true_false_items:[{id:"s1",text:"Triglyceride là triester của glycerol với acid béo."},{id:"s2",text:"Dầu thực vật thường chứa tỷ lệ gốc acid béo không no cao."},{id:"s3",text:"Thủy phân hoàn toàn triglyceride luôn chỉ cho một loại acid béo."},{id:"s4",text:"Xà phòng hóa triglyceride tạo glycerol và muối của acid béo."}],
    correct_true_false:{s1:true,s2:true,s3:false,s4:true}, explanation:"Triglyceride có thể chứa các gốc acid béo khác nhau."
  },
  {
    type:"short_answer",chapter:"c12-1",difficulty:"high_application",title:"Khối lượng methyl acetate",
    prompt:"Methyl acetate có công thức CH3COOCH3. Lấy khối lượng mol gần đúng theo C=12, H=1, O=16. Kết quả (g/mol) là bao nhiêu?",
    accepted_texts:["74","74.0","74,0","74.08","74,08"], explanation:"CH3COOCH3 = C3H6O2, M = 36 + 6 + 32 = 74 g/mol."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"high_application",title:"Sản phẩm xà phòng hóa",
    prompt:"Khi xà phòng hóa một triglyceride bằng NaOH dư, sản phẩm hữu cơ đa chức thu được là:",
    options:[{id:"A",label:"A",text:"Methanol"},{id:"B",label:"B",text:"Glycerol"},{id:"C",label:"C",text:"Ethylene glycol"},{id:"D",label:"D",text:"Glucose"}],
    correct_options:["B"], explanation:"Liên kết ester của triglyceride bị thủy phân tạo glycerol và muối acid béo."
  },
  {
    type:"true_false",chapter:"c12-1",difficulty:"high_application",title:"Tính chất của dầu mỡ",
    prompt:"Xét các phát biểu về dầu và mỡ:",
    true_false_items:[{id:"s1",text:"Dầu thường lỏng ở điều kiện thường."},{id:"s2",text:"Hydrogen hóa dầu có thể làm tăng độ no của mạch carbon."},{id:"s3",text:"Mọi acid béo đều có 18 nguyên tử carbon."},{id:"s4",text:"Mỡ và dầu đều là triglyceride hoặc hỗn hợp các triglyceride."}],
    correct_true_false:{s1:true,s2:true,s3:false,s4:true}, explanation:"Acid béo có nhiều loại chiều dài mạch; không phải mọi acid béo đều C18."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"high_application",title:"Carbohydrate",
    prompt:"Đường đơn nào là monosaccharide?",
    options:[{id:"A",label:"A",text:"Glucose"},{id:"B",label:"B",text:"Sucrose"},{id:"C",label:"C",text:"Maltose"},{id:"D",label:"D",text:"Cellulose"}],
    correct_options:["A"], explanation:"Glucose là monosaccharide; sucrose và maltose là disaccharide."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"medium",title:"Cơ bản về ester",
    prompt:"Ester thường có nhóm chức nào?",
    options:[{id:"A",label:"A",text:"–COO–"},{id:"B",label:"B",text:"–OH"},{id:"C",label:"C",text:"–NH2"},{id:"D",label:"D",text:"–CHO"}],
    correct_options:["A"], explanation:"Nhóm chức đặc trưng của ester là –COO–."
  },
  {
    type:"short_answer",chapter:"c12-1",difficulty:"medium",title:"Molar mass ethanol",
    prompt:"Khối lượng mol gần đúng của C2H5OH theo C=12, H=1, O=16 là bao nhiêu?",
    accepted_texts:["46","46.0","46,0"], explanation:"C2H6O có M = 24 + 6 + 16 = 46 g/mol."
  },
  {
    type:"true_false",chapter:"c12-2",difficulty:"medium",title:"Glucose",
    prompt:"Về glucose:",
    true_false_items:[{id:"s1",text:"Glucose là monosaccharide."},{id:"s2",text:"Glucose có thể tham gia phản ứng tráng bạc."}],
    correct_true_false:{s1:true,s2:true}, explanation:"Glucose có nhóm –CHO ở dạng mạch hở nên có tính khử."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"basic",title:"Nhận biết ethanol",
    prompt:"Chất nào có công thức C2H5OH?",
    options:[{id:"A",label:"A",text:"Ethanol"},{id:"B",label:"B",text:"Ethene"},{id:"C",label:"C",text:"Ethanal"},{id:"D",label:"D",text:"Ethanoic acid"}],
    correct_options:["A"], explanation:"C2H5OH là ethanol."
  },
  {
    type:"short_answer",chapter:"c12-1",difficulty:"basic",title:"Methyl acetate",
    prompt:"CH3COOCH3 có bao nhiêu nguyên tử carbon?",
    accepted_texts:["3"], explanation:"Có 3 nguyên tử carbon."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"basic",title:"Fructose",
    prompt:"Fructose là một:",
    options:[{id:"A",label:"A",text:"Monosaccharide"},{id:"B",label:"B",text:"Disaccharide"},{id:"C",label:"C",text:"Polysaccharide"},{id:"D",label:"D",text:"Lipid"}],
    correct_options:["A"], explanation:"Fructose là monosaccharide."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"basic",title:"Tinh bột",
    prompt:"Tinh bột thuộc nhóm:",
    options:[{id:"A",label:"A",text:"Monosaccharide"},{id:"B",label:"B",text:"Disaccharide"},{id:"C",label:"C",text:"Polysaccharide"},{id:"D",label:"D",text:"Ester"}],
    correct_options:["C"], explanation:"Tinh bột là polysaccharide."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"basic",title:"Acid acetic",
    prompt:"CH3COOH có tên thông dụng là:",
    options:[{id:"A",label:"A",text:"Acid acetic"},{id:"B",label:"B",text:"Methanol"},{id:"C",label:"C",text:"Ethyl acetate"},{id:"D",label:"D",text:"Glycerol"}],
    correct_options:["A"], explanation:"CH3COOH là acid acetic."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"basic",title:"Glycerol",
    prompt:"Glycerol có bao nhiêu nhóm hydroxyl –OH?",
    options:[{id:"A",label:"A",text:"1"},{id:"B",label:"B",text:"2"},{id:"C",label:"C",text:"3"},{id:"D",label:"D",text:"4"}],
    correct_options:["C"], explanation:"Glycerol là propane-1,2,3-triol."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"basic",title:"Maltose",
    prompt:"Maltose là carbohydrate:",
    options:[{id:"A",label:"A",text:"Monosaccharide"},{id:"B",label:"B",text:"Disaccharide"},{id:"C",label:"C",text:"Polysaccharide"},{id:"D",label:"D",text:"Peptide"}],
    correct_options:["B"], explanation:"Maltose là disaccharide."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"medium",title:"Phản ứng ester hóa",
    prompt:"Ethanol phản ứng với acid acetic có thể tạo ra:",
    options:[{id:"A",label:"A",text:"Ethyl acetate"},{id:"B",label:"B",text:"Methyl acetate"},{id:"C",label:"C",text:"Glycerol"},{id:"D",label:"D",text:"Glucose"}],
    correct_options:["A"], explanation:"Ethanol + acid acetic tạo ethyl acetate và nước."
  },
  {
    type:"true_false",chapter:"c12-1",difficulty:"medium",title:"Xà phòng",
    prompt:"Xét các phát biểu:",
    true_false_items:[{id:"s1",text:"Xà phòng thường là muối natri hoặc kali của acid béo."},{id:"s2",text:"Xà phòng hóa là phản ứng thủy phân ester trong môi trường kiềm."}],
    correct_true_false:{s1:true,s2:true}, explanation:"Đây là hai đặc điểm cơ bản của xà phòng và phản ứng xà phòng hóa."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"medium",title:"Liên kết ester",
    prompt:"Liên kết ester trong phân tử triglyceride hình thành giữa:",
    options:[{id:"A",label:"A",text:"–OH của glycerol và –COOH của acid béo"},{id:"B",label:"B",text:"–NH2 và –COOH"},{id:"C",label:"C",text:"–OH và –OH"},{id:"D",label:"D",text:"–CHO và –NH2"}],
    correct_options:["A"], explanation:"Phản ứng ester hóa giữa alcohol và carboxylic acid tạo liên kết ester."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"medium",title:"Thủy phân sucrose",
    prompt:"Thủy phân sucrose thu được:",
    options:[{id:"A",label:"A",text:"Glucose và fructose"},{id:"B",label:"B",text:"Glucose và maltose"},{id:"C",label:"C",text:"Fructose và starch"},{id:"D",label:"D",text:"Glycerol và glucose"}],
    correct_options:["A"], explanation:"Sucrose thủy phân tạo glucose và fructose."
  },
  {
    type:"short_answer",chapter:"c12-2",difficulty:"medium",title:"Glucose carbon",
    prompt:"Một phân tử glucose có bao nhiêu nguyên tử carbon?",
    accepted_texts:["6"], explanation:"Glucose có công thức C6H12O6."
  },
  {
    type:"true_false",chapter:"c12-2",difficulty:"medium",title:"Cellulose",
    prompt:"Về cellulose:",
    true_false_items:[{id:"s1",text:"Cellulose là polysaccharide."},{id:"s2",text:"Cellulose được cấu tạo từ nhiều đơn vị glucose."}],
    correct_true_false:{s1:true,s2:true}, explanation:"Cellulose là polymer thiên nhiên của các đơn vị glucose."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"high_application",title:"Hydrolysis of sucrose",
    prompt:"Trong môi trường acid, sucrose bị thủy phân hoàn toàn tạo hai monosaccharide là:",
    options:[{id:"A",label:"A",text:"Glucose và fructose"},{id:"B",label:"B",text:"Glucose và glucose"},{id:"C",label:"C",text:"Fructose và fructose"},{id:"D",label:"D",text:"Glucose và glycerol"}],
    correct_options:["A"], explanation:"Sucrose gồm glucose và fructose liên kết glycosidic."
  },
  {
    type:"true_false",chapter:"c12-2",difficulty:"high_application",title:"Tính khử của glucose",
    prompt:"Về glucose:",
    true_false_items:[{id:"s1",text:"Glucose có thể tham gia phản ứng tráng bạc."},{id:"s2",text:"Ở dạng mạch hở, glucose có nhóm aldehyde."},{id:"s3",text:"Glucose là disaccharide."}],
    correct_true_false:{s1:true,s2:true,s3:false}, explanation:"Glucose có tính khử và là monosaccharide."
  },
  {
    type:"short_answer",chapter:"c12-2",difficulty:"high_application",title:"Molar mass glucose",
    prompt:"Khối lượng mol gần đúng của glucose C6H12O6 theo C=12, H=1, O=16 là bao nhiêu?",
    accepted_texts:["180","180.0","180,0"], explanation:"M = 6×12 + 12×1 + 6×16 = 180 g/mol."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"high_application",title:"Tinh bột và iodine",
    prompt:"Thuốc thử iodine thường cho màu xanh tím đặc trưng với:",
    options:[{id:"A",label:"A",text:"Tinh bột"},{id:"B",label:"B",text:"Glucose"},{id:"C",label:"C",text:"Fructose"},{id:"D",label:"D",text:"Glycerol"}],
    correct_options:["A"], explanation:"Tinh bột tạo phức màu xanh tím với iodine."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"high_application",title:"Maltose hydrolysis",
    prompt:"Thủy phân hoàn toàn maltose thu được chủ yếu:",
    options:[{id:"A",label:"A",text:"Hai glucose"},{id:"B",label:"B",text:"Glucose và fructose"},{id:"C",label:"C",text:"Hai fructose"},{id:"D",label:"D",text:"Glycerol"}],
    correct_options:["A"], explanation:"Maltose gồm hai đơn vị glucose."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"high_application",title:"Unsaturation",
    prompt:"So với triglyceride chứa gốc acid béo no, triglyceride chứa nhiều gốc acid béo không no thường:",
    options:[{id:"A",label:"A",text:"Có nhiều liên kết C=C hơn"},{id:"B",label:"B",text:"Không có oxygen"},{id:"C",label:"C",text:"Không thể bị hydrogen hóa"},{id:"D",label:"D",text:"Luôn là chất rắn"}],
    correct_options:["A"], explanation:"Acid béo không no chứa một hoặc nhiều liên kết C=C."
  },
  {
    type:"short_answer",chapter:"c12-1",difficulty:"medium",title:"Carbon in ester",
    prompt:"Ethyl acetate CH3COOC2H5 có bao nhiêu nguyên tử carbon?",
    accepted_texts:["4"], explanation:"Có 4 nguyên tử carbon."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"medium",title:"Ethyl acetate",
    prompt:"Công thức phân tử của ethyl acetate là:",
    options:[{id:"A",label:"A",text:"C4H8O2"},{id:"B",label:"B",text:"C3H6O2"},{id:"C",label:"C",text:"C2H6O"},{id:"D",label:"D",text:"C4H10O"}],
    correct_options:["A"], explanation:"Ethyl acetate có công thức C4H8O2."
  },
  {
    type:"single",chapter:"c12-1",difficulty:"medium",title:"Methyl acetate",
    prompt:"Methyl acetate có công thức:",
    options:[{id:"A",label:"A",text:"CH3COOCH3"},{id:"B",label:"B",text:"CH3COOC2H5"},{id:"C",label:"C",text:"CH3CH2OH"},{id:"D",label:"D",text:"CH3COOH"}],
    correct_options:["A"], explanation:"Methyl acetate là CH3COOCH3."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"basic",title:"Glucose formula",
    prompt:"Công thức phân tử của glucose là:",
    options:[{id:"A",label:"A",text:"C6H12O6"},{id:"B",label:"B",text:"C12H22O11"},{id:"C",label:"C",text:"C5H10O5"},{id:"D",label:"D",text:"C3H8O3"}],
    correct_options:["A"], explanation:"Glucose có công thức C6H12O6."
  },
  {
    type:"single",chapter:"c12-2",difficulty:"basic",title:"Cellulose group",
    prompt:"Cellulose là:",
    options:[{id:"A",label:"A",text:"Polysaccharide"},{id:"B",label:"B",text:"Monosaccharide"},{id:"C",label:"C",text:"Disaccharide"},{id:"D",label:"D",text:"Ester"}],
    correct_options:["A"], explanation:"Cellulose là polysaccharide."
  },
  {
    type:"short_answer",chapter:"c12-1",difficulty:"basic",title:"Carbon ethyl acetate",
    prompt:"Ethyl acetate CH3COOC2H5 có bao nhiêu nguyên tử carbon?",
    accepted_texts:["4"], explanation:"Phân tử có 4 nguyên tử carbon."
  },
  {
    type:"short_answer",chapter:"c12-2",difficulty:"medium",title:"Sucrose carbon count",
    prompt:"Một phân tử sucrose có tổng cộng bao nhiêu nguyên tử carbon?",
    accepted_texts:["12"], explanation:"Sucrose có công thức C12H22O11."
  }
];

for(const q of questions){
  const [existing]=await sql`SELECT id FROM questions WHERE title=${q.title} AND difficulty=${q.difficulty} LIMIT 1`;
  if(existing) continue;
  await sql`
    INSERT INTO questions(type,chapter,difficulty,title,prompt,options,true_false_items,correct_options,correct_true_false,accepted_texts,explanation,published)
    VALUES(${q.type},${q.chapter},${q.difficulty},${q.title},${q.prompt},
      ${JSON.stringify(q.options??[])}::jsonb,
      ${JSON.stringify(q.true_false_items??[])}::jsonb,
      ${JSON.stringify(q.correct_options??[])}::jsonb,
      ${JSON.stringify(q.correct_true_false??{})}::jsonb,
      ${JSON.stringify(q.accepted_texts??[])}::jsonb,
      ${q.explanation??""},true)
  `;
}
console.log("Seed complete.",{adminId:admin.id,studentId:student.id,classId:cls.id,questionCount:questions.length});
