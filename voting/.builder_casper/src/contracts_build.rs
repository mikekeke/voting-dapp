mod flipper {
    odra::casper::codegen::gen_contract!(voting::Flipper, "flipper");
}
mod governor {
    odra::casper::codegen::gen_contract!(voting::governor::Governor, "governor");
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    args.iter().skip(1).for_each(|arg| match arg.as_str() {
        "flipper" => flipper::main(),
        "governor" => governor::main(),
        _ => println!("Please provide a valid module name!"),
    });
}
